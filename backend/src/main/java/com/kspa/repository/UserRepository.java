package com.kspa.repository;

import com.kspa.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmpNumber(String empNumber);
    Optional<User> findByEmail(String email);
    Boolean existsByEmpNumber(String empNumber);
    Boolean existsByEmail(String email);

    @Query("{'active': true}")
    List<User> findAllActiveUsers();

    @Query("{'type': ?0, 'active': true}")
    List<User> findByTypeAndActive(String type);

    @Query("{'empNumber': ?0, 'active': true}")
    Optional<User> findByEmpNumberAndActive(String empNumber);

    @Query("{'email': ?0, 'active': true}")
    Optional<User> findByEmailAndActive(String email);
}