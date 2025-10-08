package com.kspa.repository;

import com.kspa.model.ChecklistEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChecklistEntryRepository extends MongoRepository<ChecklistEntry, String> {

    @Query("{'technicianId': ?0}")
    List<ChecklistEntry> findByTechnicianId(String technicianId);

    @Query("{'engineerId': ?0}")
    List<ChecklistEntry> findByEngineerId(String engineerId);

    @Query("{'locationType': ?0}")
    List<ChecklistEntry> findByLocationType(String locationType);

    @Query("{'location': ?0}")
    List<ChecklistEntry> findByLocation(String location);

    @Query("{'locationType': ?0, 'locationId': ?1, 'section': ?2}")
    List<ChecklistEntry> findByLocationTypeAndLocationIdAndSection(String locationType, String locationId, String section);

    @Query("{'status': ?0}")
    List<ChecklistEntry> findByStatus(String status);

    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
    List<ChecklistEntry> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'machineId': ?0, 'createdAt': {$gte: ?1, $lte: ?2}}")
    List<ChecklistEntry> findByMachineIdAndDateRange(String machineId, LocalDateTime startDate, LocalDateTime endDate);
}