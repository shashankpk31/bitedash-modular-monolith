package com.bitedash.menu.repository;

import com.bitedash.menu.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

	@EntityGraph(value = "Category.withMenuItems", type = EntityGraph.EntityGraphType.LOAD)
	Optional<Category> findWithMenuItemsById(Long id);

	List<Category> findAllByOrderByDisplayOrderAsc();

	List<Category> findByVendorIdOrderByDisplayOrderAsc(Long vendorId);

	List<Category> findByIsFeaturedTrueOrderByDisplayOrderAsc();

	List<Category> findByVendorIdAndIsFeaturedTrueOrderByDisplayOrderAsc(Long vendorId);

	long countByVendorId(Long vendorId);
	long countByIsFeaturedTrue();
}
