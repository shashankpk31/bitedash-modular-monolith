package com.bitedash.organisation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bitedash.organisation.entity.Cafeteria;

@Repository
public interface CafeteriaRepository extends JpaRepository<Cafeteria, Long> {

	List<Cafeteria> findByOffice_Id(Long officeId);

	long countByOffice_Id(Long officeId);

	long countByOffice_Location_Id(Long locationId);

	long countByOffice_Location_Organization_Id(Long organizationId);
}
