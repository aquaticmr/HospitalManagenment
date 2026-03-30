package com.hospital.repository;

import com.hospital.model.TimeSlot;
import com.hospital.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    List<TimeSlot> findByDoctor(User doctor);
    List<TimeSlot> findByDoctorAndIsBookedFalse(User doctor);
}
