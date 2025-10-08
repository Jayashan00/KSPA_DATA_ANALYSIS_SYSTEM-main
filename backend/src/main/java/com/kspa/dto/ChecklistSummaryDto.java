// File: src/main/java/com/kspa/dto/ChecklistSummaryDto.java
package com.kspa.dto;

import java.time.LocalDate;

public class ChecklistSummaryDto {
    private String id;
    private LocalDate date;
    private String shift;
    private String status;
    private String technicianName;
    private long entryCount;
    private String locationType;

    // Constructors
    public ChecklistSummaryDto() {}

    public ChecklistSummaryDto(LocalDate date, String shift, String status, String technicianName, long entryCount, String locationType) {
        this.date = date;
        this.shift = shift;
        this.status = status;
        this.technicianName = technicianName;
        this.entryCount = entryCount;
        this.locationType = locationType;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public long getEntryCount() { return entryCount; }
    public void setEntryCount(long entryCount) { this.entryCount = entryCount; }

    public String getLocationType() { return locationType; }
    public void setLocationType(String locationType) { this.locationType = locationType; }
}