package com.bitedash.menu.repository;

import com.bitedash.menu.entity.MenuItemAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuItemAddonRepository extends JpaRepository<MenuItemAddon, Long> {
}
