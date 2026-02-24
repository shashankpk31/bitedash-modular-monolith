package com.bitedash.organisation.repository;

import com.bitedash.organisation.entity.VendorOperatingHour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorOperatingHourRepository extends JpaRepository<VendorOperatingHour, Long> {
}
