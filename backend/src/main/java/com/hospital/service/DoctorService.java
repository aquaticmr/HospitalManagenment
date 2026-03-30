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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository userRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final AppointmentRepository appointmentRepository;

    /**
     * Add a new availability slot for the authenticated doctor.
     */
    @Transactional
    public Map<String, Object> addSlot(String startTimeStr, String endTimeStr, String username) {
        User doctor = getByUsername(username);
        TimeSlot slot = TimeSlot.builder()
                .doctor(doctor)
                .startTime(LocalDateTime.parse(startTimeStr))
                .endTime(LocalDateTime.parse(endTimeStr))
                .build();
        TimeSlot saved = timeSlotRepository.save(slot);
        return slotToMap(saved);
    }

    /**
     * Return all slots belonging to the authenticated doctor.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMySlots(String username) {
        User doctor = getByUsername(username);
        return timeSlotRepository.findByDoctor(doctor).stream()
                .map(this::slotToMap)
                .collect(Collectors.toList());
    }

    /**
     * Delete a slot that belongs to the authenticated doctor (only if not yet booked).
     */
    @Transactional
    public void deleteSlot(Long slotId, String username) {
        User doctor = getByUsername(username);
        TimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new SecurityException("You do not own this slot");
        }
        timeSlotRepository.delete(slot);
    }

    /**
     * Return all appointment requests for the authenticated doctor.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAppointments(String username) {
        User doctor = getByUsername(username);
        return appointmentRepository.findBySlotDoctor(doctor).stream()
                .map(this::appointmentToMap)
                .collect(Collectors.toList());
    }

    /**
     * Approve or reject an appointment.
     */
    @Transactional
    public Map<String, Object> updateAppointmentStatus(Long appointmentId, String status, String username) {
        User doctor = getByUsername(username);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getSlot().getDoctor().getId().equals(doctor.getId())) {
            throw new SecurityException("You do not own this appointment");
        }

        Appointment.Status newStatus = Appointment.Status.valueOf(status.toUpperCase());
        appointment.setStatus(newStatus);

        return appointmentToMap(appointmentRepository.save(appointment));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private Map<String, Object> slotToMap(TimeSlot s) {
        return Map.of(
                "id", s.getId(),
                "startTime", s.getStartTime().toString(),
                "endTime", s.getEndTime().toString(),
                "isBooked", s.isBooked()
        );
    }

    private Map<String, Object> appointmentToMap(Appointment a) {
        return Map.of(
                "id", a.getId(),
                "patientName", a.getPatient().getFullName(),
                "patientUsername", a.getPatient().getUsername(),
                "startTime", a.getSlot().getStartTime().toString(),
                "endTime", a.getSlot().getEndTime().toString(),
                "status", a.getStatus().name(),
                "queueNumber", a.getQueueNumber()
        );
    }
}
