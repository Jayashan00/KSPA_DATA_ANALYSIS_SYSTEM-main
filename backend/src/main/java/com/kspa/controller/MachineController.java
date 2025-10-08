package com.kspa.controller;

import com.kspa.dto.MessageResponse;
import com.kspa.model.Machine;
import com.kspa.repository.MachineRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class MachineController {

    @Autowired
    MachineRepository machineRepository;

    @GetMapping("/technician/machines")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'TECHNICIAN')")
    public ResponseEntity<List<Machine>> getAllMachinesForTechnician() {
        List<Machine> machines = machineRepository.findAllActiveMachines();
        return ResponseEntity.ok(machines);
    }

    @GetMapping("/admin/machines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Machine>> getAllMachinesForAdmin() {
        List<Machine> machines = machineRepository.findAllActiveMachines();
        return ResponseEntity.ok(machines);
    }

    @GetMapping("/technician/machines/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'TECHNICIAN')")
    public ResponseEntity<List<Machine>> getMachinesByType(@PathVariable String type) {
        List<Machine> machines = machineRepository.findByTypeAndActive(type.toUpperCase());
        return ResponseEntity.ok(machines);
    }

    @GetMapping("/technician/machines/location/{location}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'TECHNICIAN')")
    public ResponseEntity<List<Machine>> getMachinesByLocation(@PathVariable String location) {
        List<Machine> machines = machineRepository.findByLocationAndActive(location);
        return ResponseEntity.ok(machines);
    }

    @PostMapping("/admin/machines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createMachine(@Valid @RequestBody Machine machine) {
        try {
            Machine savedMachine = machineRepository.save(machine);
            return ResponseEntity.ok(savedMachine);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Failed to create machine - " + e.getMessage()));
        }
    }

    @PutMapping("/admin/machines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMachine(@PathVariable String id, @Valid @RequestBody Machine machineDetails) {
        Machine machine = machineRepository.findById(id).orElse(null);

        if (machine == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Machine not found!"));
        }

        machine.setName(machineDetails.getName());
        machine.setLocation(machineDetails.getLocation());
        machine.setSection(machineDetails.getSection());
        machine.setType(machineDetails.getType());
        machine.setDescription(machineDetails.getDescription());

        try {
            Machine updatedMachine = machineRepository.save(machine);
            return ResponseEntity.ok(updatedMachine);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Failed to update machine - " + e.getMessage()));
        }
    }

    @DeleteMapping("/admin/machines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMachine(@PathVariable String id) {
        Machine machine = machineRepository.findById(id).orElse(null);

        if (machine == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Machine not found!"));
        }

        machine.setActive(false);
        machineRepository.save(machine);

        return ResponseEntity.ok(new MessageResponse("Machine deleted successfully!"));
    }
}