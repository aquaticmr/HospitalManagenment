package com.hospital.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String role; // DOCTOR or PATIENT
    private String specialization; // optional, for doctors
}
