package com.bitedash.organisation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bitedash.organisation.entity.VendorCafeteriaMapping;

@Repository
public interface VendorCafeteriaMappingRepository extends JpaRepository<VendorCafeteriaMapping, Long> {

	List<VendorCafeteriaMapping> findByVendor_Id(Long vendorId);

	List<VendorCafeteriaMapping> findByCafeteria_Id(Long cafeteriaId);

	List<VendorCafeteriaMapping> findByVendor_IdAndIsActiveTrue(Long vendorId);

	List<VendorCafeteriaMapping> findByCafeteria_IdAndIsActiveTrue(Long cafeteriaId);

	Optional<VendorCafeteriaMapping> findByVendor_IdAndCafeteria_Id(Long vendorId, Long cafeteriaId);

	Optional<VendorCafeteriaMapping> findByVendor_IdAndIsPrimaryTrue(Long vendorId);

	boolean existsByVendor_IdAndCafeteria_Id(Long vendorId, Long cafeteriaId);

}
