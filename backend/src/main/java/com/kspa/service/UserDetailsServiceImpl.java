package com.kspa.service;

import com.kspa.model.User;
import com.kspa.repository.UserRepository;
import com.kspa.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String empNumber) throws UsernameNotFoundException {
        User user = userRepository.findByEmpNumber(empNumber)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with employee number: " + empNumber));

        return UserPrincipal.create(user);
    }
}