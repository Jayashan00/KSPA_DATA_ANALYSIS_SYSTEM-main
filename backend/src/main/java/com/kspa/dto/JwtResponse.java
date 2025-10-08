package com.kspa.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String empNumber;
    private String fullName;
    private String email;
    private String userType;
    private List<String> roles;

    public JwtResponse(String accessToken, String id, String empNumber, String fullName, 
                      String email, String userType, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.empNumber = empNumber;
        this.fullName = fullName;
        this.email = email;
        this.userType = userType;
        this.roles = roles;
    }

    // Getters and Setters
    public String getAccessToken() { return token; }
    public void setAccessToken(String accessToken) { this.token = accessToken; }

    public String getTokenType() { return type; }
    public void setTokenType(String tokenType) { this.type = tokenType; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmpNumber() { return empNumber; }
    public void setEmpNumber(String empNumber) { this.empNumber = empNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}