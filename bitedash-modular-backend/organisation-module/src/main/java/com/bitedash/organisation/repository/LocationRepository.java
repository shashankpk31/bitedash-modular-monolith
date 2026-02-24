package com.bitedash.organisation.repository;

import com.bitedash.organisation.entity.Location;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

	List<Location> findByOrganization_Id(Long organizationId);

	long countByOrganization_Id(Long organizationId);
}
