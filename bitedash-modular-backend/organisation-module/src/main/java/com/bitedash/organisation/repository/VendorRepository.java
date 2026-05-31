package com.bitedash.organisation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bitedash.organisation.entity.Cafeteria;
import com.bitedash.organisation.entity.Vendor;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

	List<Vendor> findByCafeteriaMappings_Cafeteria(Cafeteria cafeteria);

	Optional<Vendor> findByOwnerUserId(Long ownerUserId);

	/**
	 * Count active vendors efficiently (avoids N+1 query).
	 */
	long countByIsActiveTrue();

	/**
	 * Count vendors by cafeteria and active status.
	 */
	long countByCafeteriaMappings_CafeteriaAndIsActiveTrue(Cafeteria cafeteria);
}
