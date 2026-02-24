package com.bitedash.organisation.repository;

import com.bitedash.organisation.entity.Office;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfficeRepository extends JpaRepository<Office, Long> {

	List<Office> findByLocation_Id(Long locationId);

	long countByLocation_Id(Long locationId);

	long countByLocation_Organization_Id(Long organizationId);
}
