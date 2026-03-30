package com.hospital.controller;

import com.hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/slots")
    public ResponseEntity<?> addSlot(@RequestBody Map<String, String> body, Principal principal) {
        return ResponseEntity.ok(
                doctorService.addSlot(body.get("startTime"), body.get("endTime"), principal.getName())
        );
    }

    @GetMapping("/slots")
    public ResponseEntity<?> getMySlots(Principal principal) {
        return ResponseEntity.ok(doctorService.getMySlots(principal.getName()));
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id, Principal principal) {
        try {
            doctorService.deleteSlot(id, principal.getName());
            return ResponseEntity.ok("Slot deleted");
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(Principal principal) {
        return ResponseEntity.ok(doctorService.getAppointments(principal.getName()));
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        return ResponseEntity.ok(
                doctorService.updateAppointmentStatus(id, body.get("status"), principal.getName())
        );
    }
}
