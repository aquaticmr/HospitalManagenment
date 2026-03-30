package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.TimeSlot;
import com.hospital.model.User;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.TimeSlotRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final UserRepository userRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final AppointmentRepository appointmentRepository;

    /**
     * Search doctors by name (optional) – returns all doctors when search is blank.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDoctors(String search) {
        List<User> doctors;
        if (search != null && !search.isBlank()) {
            doctors = userRepository.findByRoleAndFullNameContainingIgnoreCase(User.Role.DOCTOR, search);
        } else {
            doctors = userRepository.findByRole(User.Role.DOCTOR);
        }
        return doctors.stream().map(this::doctorToMap).collect(Collectors.toList());
    }

    /**
     * Return all unbooked slots for a given doctor.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableSlots(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return timeSlotRepository.findByDoctor(doctor).stream()
                .map(s -> Map.<String, Object>of(
                        "id", s.getId(),
                        "startTime", s.getStartTime().toString(),
                        "endTime", s.getEndTime().toString()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Book a slot – marks it as booked and creates an PENDING appointment.
     */
    @Transactional
    public Map<String, Object> bookSlot(Long slotId, String username) {
        User patient = getByUsername(username);

        TimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));



        // Calculate Queue Number (per-doctor, per-day)
        LocalDateTime dayStart = slot.getStartTime().toLocalDate().atStartOfDay();
        LocalDateTime dayEnd = slot.getStartTime().toLocalDate().atTime(LocalTime.MAX);
        long count = appointmentRepository.countBySlotDoctorAndSlotStartTimeBetween(slot.getDoctor(), dayStart, dayEnd);
        int queueNumber = (int) count + 1;

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .slot(slot)
                .queueNumber(queueNumber)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return Map.of(
                "id", saved.getId(),
                "status", saved.getStatus().name(),
                "doctorName", slot.getDoctor().getFullName(),
                "startTime", slot.getStartTime().toString(),
                "endTime", slot.getEndTime().toString(),
                "queueNumber", saved.getQueueNumber()
        );
    }

    /**
     * Return all appointments for the authenticated patient.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyAppointments(String username) {
        User patient = getByUsername(username);
        return appointmentRepository.findByPatient(patient).stream()
                .map(a -> Map.<String, Object>of(
                        "id", a.getId(),
                        "doctorName", a.getSlot().getDoctor().getFullName(),
                        "startTime", a.getSlot().getStartTime().toString(),
                        "endTime", a.getSlot().getEndTime().toString(),
                        "status", a.getStatus().name(),
                        "queueNumber", a.getQueueNumber()
                ))
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private Map<String, Object> doctorToMap(User d) {
        return Map.of(
                "id", d.getId(),
                "fullName", d.getFullName(),
                "username", d.getUsername(),
                "specialization", d.getSpecialization() != null ? d.getSpecialization() : ""
        );
    }
}
