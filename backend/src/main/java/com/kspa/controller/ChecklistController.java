package com.kspa.controller;

import com.kspa.dto.ChecklistSummaryDto;
import com.kspa.dto.MessageResponse;
import com.kspa.model.ChecklistEntry;
import com.kspa.repository.ChecklistEntryRepository;
import com.kspa.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ChecklistController {

    @Autowired
    private ChecklistEntryRepository checklistEntryRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    // ==============================
    // TECHNICIAN ENDPOINTS
    // ==============================

    @PostMapping("/technician/checklist")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'TECHNICIAN')")
    public ResponseEntity<?> submitChecklist(@Valid @RequestBody ChecklistEntry checklistEntry,
                                             Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            checklistEntry.setTechnicianId(userPrincipal.getId());
            checklistEntry.setTechnicianName(userPrincipal.getFullName());
            if (checklistEntry.getStatus() == null || checklistEntry.getStatus().isEmpty()) {
                checklistEntry.setStatus("PENDING");
            }
            checklistEntry.setCreatedAt(LocalDateTime.now());

            ChecklistEntry savedEntry = checklistEntryRepository.save(checklistEntry);
            return ResponseEntity.ok(savedEntry);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Failed to save checklist - " + e.getMessage()));
        }
    }

    @GetMapping("/technician/checklist")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'TECHNICIAN')")
    public ResponseEntity<List<ChecklistEntry>> getMyChecklists(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<ChecklistEntry> entries = checklistEntryRepository.findByTechnicianId(userPrincipal.getId());
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/technician/checklist/location/{locationType}/{locationId}/{subsection}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'TECHNICIAN')")
    public ResponseEntity<List<ChecklistEntry>> getByLocationAndSubsection(
            @PathVariable String locationType,
            @PathVariable String locationId,
            @PathVariable String subsection) {
        List<ChecklistEntry> entries = checklistEntryRepository.findByLocationTypeAndLocationIdAndSection(
                locationType, locationId, subsection);
        return ResponseEntity.ok(entries);
    }

    @PutMapping("/technician/checklist/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'TECHNICIAN')")
    public ResponseEntity<?> updateChecklist(@PathVariable String id,
                                             @Valid @RequestBody ChecklistEntry checklistDetails,
                                             Authentication authentication) {
        ChecklistEntry entry = checklistEntryRepository.findById(id).orElse(null);
        if (entry == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Checklist entry not found!"));
        }

        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            if (!entry.getTechnicianId().equals(userPrincipal.getId()) &&
                    !userPrincipal.getAuthorities().stream().anyMatch(a ->
                            a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_ENGINEER"))) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Error: You are not authorized to update this entry."));
            }

            entry.setFormData(checklistDetails.getFormData());
            if (checklistDetails.getStatus() != null) {
                entry.setStatus(checklistDetails.getStatus());
            }

            entry.setUpdatedAt(LocalDateTime.now());
            entry.setMachineName(checklistDetails.getMachineName());
            entry.setSection(checklistDetails.getSection());
            entry.setLocationType(checklistDetails.getLocationType());
            entry.setLocationId(checklistDetails.getLocationId());
            entry.setSubsection(checklistDetails.getSubsection());
            entry.setShift(checklistDetails.getShift());

            ChecklistEntry updatedEntry = checklistEntryRepository.save(entry);
            return ResponseEntity.ok(updatedEntry);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Failed to update checklist - " + e.getMessage()));
        }
    }

    // ==============================
    // ENGINEER / ADMIN ENDPOINTS
    // ==============================

    @GetMapping("/engineer/checklist")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER')")
    public ResponseEntity<List<ChecklistEntry>> getAllChecklists() {
        List<ChecklistEntry> entries = checklistEntryRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/engineer/checklist/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER')")
    public ResponseEntity<List<ChecklistSummaryDto>> getChecklistSummary() {
        Aggregation aggregation = newAggregation(
                sort(Sort.Direction.DESC, "createdAt"),
                project()
                        .and("createdAt").dateAsFormattedString("%Y-%m-%d").as("dateStr")
                        .andInclude("shift", "status", "technicianName", "locationType"),
                group("dateStr", "shift", "locationType")
                        .first("technicianName").as("technicianName")
                        .push("status").as("statuses")
                        .count().as("entryCount"),
                project("entryCount", "technicianName")
                        .and("_id.dateStr").as("date")
                        .and("_id.shift").as("shift")
                        .and("_id.locationType").as("locationType")
                        .andExpression(
                                "cond(" +
                                        "  [ $statuses == null, false ], " +
                                        "  'PENDING', " +
                                        "  cond( " +
                                        "    [ $eq: [ { $indexOfArray: [ '$statuses', 'REJECTED' ] }, -1 ] ], " +
                                        "    cond( [ $eq: [ { $indexOfArray: [ '$statuses', 'PENDING' ] }, -1 ] ], 'APPROVED', 'PENDING' ), " +
                                        "    'REJECTED' " +
                                        "  ) " +
                                        ")")
                        .as("status")
        );

        AggregationResults<ChecklistSummaryDto> results = mongoTemplate.aggregate(
                aggregation, "checklist_entries", ChecklistSummaryDto.class);
        return ResponseEntity.ok(results.getMappedResults());
    }

    @GetMapping("/engineer/checklist/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER')")
    public ResponseEntity<List<ChecklistEntry>> getChecklistsByType(@PathVariable String type) {
        List<ChecklistEntry> entries = checklistEntryRepository.findByLocationType(type.toLowerCase());
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/engineer/checklist/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER')")
    public ResponseEntity<List<ChecklistEntry>> getChecklistsByStatus(@PathVariable String status) {
        List<ChecklistEntry> entries = checklistEntryRepository.findByStatus(status.toUpperCase());
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/engineer/checklist/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER')")
    public ResponseEntity<List<ChecklistEntry>> getChecklistsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<ChecklistEntry> entries = checklistEntryRepository.findByDateRange(start, end);
        return ResponseEntity.ok(entries);
    }

    // ==============================
    // UNIFIED REVIEW ENDPOINT (APPROVE / REJECT / EDIT)
    // ==============================

    /**
     * Unified endpoint for:
     *   - APPROVE
     *   - REJECT (requires remarks)
     *   - EDIT   (updates formData only, keeps current status)
     *
     * Payload example:
     * {
     *   "action": "APPROVE"
     * }
     * {
     *   "action": "REJECT",
     *   "remarks": "Missing oil level"
     * }
     * {
     *   "action": "EDIT",
     *   "formData": { "temperature": "85°C", "oilLevel": "Normal" },
     *   "remarks": "Corrected values"
     * }
     */
    @PutMapping("/engineer/checklist/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER')")
    public ResponseEntity<?> reviewChecklist(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {

        ChecklistEntry entry = checklistEntryRepository.findById(id).orElse(null);
        if (entry == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Checklist entry not found!"));
        }

        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();
        String action = (String) payload.get("action");

        if (action == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Missing 'action' in payload"));
        }

        // -----------------------------------------------------------------
        // 1. APPROVE
        // -----------------------------------------------------------------
        if ("APPROVE".equalsIgnoreCase(action)) {
            entry.setStatus("APPROVED");
            entry.setRemarks(null); // clear any previous remarks
        }

        // -----------------------------------------------------------------
        // 2. REJECT
        // -----------------------------------------------------------------
        else if ("REJECT".equalsIgnoreCase(action)) {
            String remarks = (String) payload.get("remarks");
            if (remarks == null || remarks.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Remarks are required when rejecting"));
            }
            entry.setStatus("REJECTED");
            entry.setRemarks(remarks.trim());
        }

        // -----------------------------------------------------------------
        // 3. EDIT (only formData)
        // -----------------------------------------------------------------
        else if ("EDIT".equalsIgnoreCase(action)) {
            Object formDataObj = payload.get("formData");
            if (formDataObj == null || !(formDataObj instanceof Map)) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("formData (Map) is required for EDIT"));
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> formData = (Map<String, Object>) formDataObj;

            entry.setFormData(formData);

            // Optional remarks for audit
            String editRemarks = (String) payload.get("remarks");
            if (editRemarks != null && !editRemarks.trim().isEmpty()) {
                entry.setRemarks(editRemarks.trim());
            }
        }

        // -----------------------------------------------------------------
        // Invalid action
        // -----------------------------------------------------------------
        else {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid action. Use 'APPROVE', 'REJECT' or 'EDIT'"));
        }

        // Common fields for all actions
        entry.setApprovedBy(user.getFullName());
        entry.setApprovedAt(LocalDateTime.now());
        entry.setUpdatedAt(LocalDateTime.now());

        ChecklistEntry saved = checklistEntryRepository.save(entry);
        return ResponseEntity.ok(saved);
    }
}
