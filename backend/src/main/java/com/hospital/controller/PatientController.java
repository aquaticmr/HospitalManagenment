package com.hospital.controller;

import com.hospital.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/doctors")
    public ResponseEntity<?> getDoctors(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(patientService.getDoctors(search));
    }

    @GetMapping("/doctors/{doctorId}/slots")
    public ResponseEntity<?> getDoctorSlots(@PathVariable Long doctorId) {
        return ResponseEntity.ok(patientService.getAvailableSlots(doctorId));
    }

    @PostMapping("/book/{slotId}")
    public ResponseEntity<?> bookSlot(@PathVariable Long slotId, Principal principal) {
        try {
            return ResponseEntity.ok(patientService.bookSlot(slotId, principal.getName()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getMyAppointments(Principal principal) {
        return ResponseEntity.ok(patientService.getMyAppointments(principal.getName()));
    }
}
