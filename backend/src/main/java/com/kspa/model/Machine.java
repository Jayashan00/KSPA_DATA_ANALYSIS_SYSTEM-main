package com.kspa.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "machines")
public class Machine {
    @Id
    private String id;

    @NotBlank(message = "Machine name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Section is required")
    private String section;

    @NotBlank(message = "Engineer type is required")
    private String engineer; // Electrical, Mechanical

    private String description;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private boolean active = true;

    public Machine() {}

    public Machine(String name, String location, String section, String engineer) {
        this.name = name;
        this.location = location;
        this.section = section;
        this.engineer = engineer;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getEngineer() { return engineer; }
    public void setEngineer(String engineer) { this.engineer = engineer; }

    public String getType() { return engineer; } // For compatibility
    public void setType(String type) { this.engineer = type; } // For compatibility

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}