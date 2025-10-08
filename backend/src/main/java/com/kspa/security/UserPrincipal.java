package com.kspa.security;

import com.kspa.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class UserPrincipal implements UserDetails {
    private String id;
    private String empNumber;
    private String fullName;
    private String email;
    private String password;
    private String type;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String empNumber, String fullName, String email, String password, String type,
                        Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.empNumber = empNumber;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.type = type;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());

        return new UserPrincipal(
                user.getId(),
                user.getEmpNumber(),
                user.getFullName(),
                user.getEmail(),
                user.getPassword(),
                user.getType(),
                authorities
        );
    }

    // Getters
    public String getId() { return id; }
    public String getEmpNumber() { return empNumber; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getType() { return type; }

    @Override
    public String getUsername() { return empNumber; }

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}