package com.kspa.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "checklist_entries")
public class ChecklistEntry {
    @Id
    private String id;

    private String machineId;
    private String machineName;
    private String location;
    private String locationId;
    private String section;
    private String subsection;
    private String locationType; // electrical, mechanical

    // Day/Night shift
    private String shift;

    // --- NEW FIELDS ---
    private String shiftEngineerName; // To store the engineer's name
    private String abcShift; // To store the A, B, or C shift

    private String technicianId;
    private String technicianName;
    private String engineerId;
    private String engineerName;
    private String createdBy;

    private Map<String, Object> formData; // Dynamic form data

    private String status; // PENDING, APPROVED, REJECTED
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String remarks;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public ChecklistEntry() {}

    // --- ADD GETTERS AND SETTERS FOR NEW FIELDS ---
    public String getShiftEngineerName() { return shiftEngineerName; }
    public void setShiftEngineerName(String shiftEngineerName) { this.shiftEngineerName = shiftEngineerName; }

    public String getAbcShift() { return abcShift; }
    public void setAbcShift(String abcShift) { this.abcShift = abcShift; }


    // Getters and Setters for existing fields...
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMachineId() { return machineId; }
    public void setMachineId(String machineId) { this.machineId = machineId; }

    public String getMachineName() { return machineName; }
    public void setMachineName(String machineName) { this.machineName = machineName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getSubsection() { return subsection; }
    public void setSubsection(String subsection) { this.subsection = subsection; }

    public String getLocationType() { return locationType; }
    public void setLocationType(String locationType) { this.locationType = locationType; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public String getTechnicianId() { return technicianId; }
    public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public String getEngineerId() { return engineerId; }
    public void setEngineerId(String engineerId) { this.engineerId = engineerId; }

    public String getEngineerName() { return engineerName; }
    public void setEngineerName(String engineerName) { this.engineerName = engineerName; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Map<String, Object> getFormData() { return formData; }
    public void setFormData(Map<String, Object> formData) { this.formData = formData; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}