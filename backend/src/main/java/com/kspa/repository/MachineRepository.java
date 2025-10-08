package com.kspa.repository;

import com.kspa.model.Machine;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineRepository extends MongoRepository<Machine, String> {

    @Query("{'active': true}")
    List<Machine> findAllActiveMachines();

    @Query("{'engineer': ?0, 'active': true}")
    List<Machine> findByTypeAndActive(String type);

    @Query("{'location': ?0, 'active': true}")
    List<Machine> findByLocationAndActive(String location);

    @Query("{'location': ?0, 'section': ?1, 'active': true}")
    List<Machine> findByLocationAndSectionAndActive(String location, String section);
}