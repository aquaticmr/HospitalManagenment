package com.hospital.repository;

import com.hospital.model.Appointment;
import com.hospital.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(User patient);
    List<Appointment> findBySlotDoctor(User doctor);
    long countBySlotDoctorAndSlotStartTimeBetween(User doctor, LocalDateTime start, LocalDateTime end);
}
