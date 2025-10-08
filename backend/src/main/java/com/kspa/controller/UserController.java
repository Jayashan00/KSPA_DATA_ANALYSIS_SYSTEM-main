package com.kspa.controller;

import com.kspa.dto.MessageResponse;
import com.kspa.dto.SignupRequest;
import com.kspa.model.Role;
import com.kspa.model.User;
import com.kspa.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAllActiveUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmpNumber(signUpRequest.getEmpNumber())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Employee Number is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User(signUpRequest.getEmpNumber(),
                signUpRequest.getFullName(),
                signUpRequest.getNic(),
                signUpRequest.getPhoneNumber(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getType());

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            roles.add(Role.TECHNICIAN);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        roles.add(Role.ADMIN);
                        break;
                    case "engineer":
                        roles.add(Role.ENGINEER);
                        break;
                    default:
                        roles.add(Role.TECHNICIAN);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User created successfully!"));
    }

    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable String id, @Valid @RequestBody SignupRequest updateRequest) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null || !user.isActive()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User not found!"));
        }

        // Check if email is already taken by another user
        User existingEmailUser = userRepository.findByEmail(updateRequest.getEmail()).orElse(null);
        if (existingEmailUser != null && !existingEmailUser.getId().equals(id) && existingEmailUser.isActive()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Check if empNumber is already taken by another user
        User existingEmpUser = userRepository.findByEmpNumber(updateRequest.getEmpNumber()).orElse(null);
        if (existingEmpUser != null && !existingEmpUser.getId().equals(id) && existingEmpUser.isActive()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Employee Number is already taken!"));
        }

        user.setEmpNumber(updateRequest.getEmpNumber());
        user.setFullName(updateRequest.getFullName());
        user.setNic(updateRequest.getNic());
        user.setPhoneNumber(updateRequest.getPhoneNumber());
        user.setEmail(updateRequest.getEmail());
        user.setType(updateRequest.getType());

        // Only update password if provided
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(updateRequest.getPassword()));
        }

        Set<String> strRoles = updateRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            roles.add(Role.TECHNICIAN);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        roles.add(Role.ADMIN);
                        break;
                    case "engineer":
                        roles.add(Role.ENGINEER);
                        break;
                    default:
                        roles.add(Role.TECHNICIAN);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User not found!"));
        }

        // Permanently delete the user from database
        userRepository.deleteById(id);

        return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
    }
}