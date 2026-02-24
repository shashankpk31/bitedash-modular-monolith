package com.bitedash.menu.api.impl;

import com.bitedash.menu.entity.MenuItem;
import com.bitedash.menu.repository.MenuItemRepository;
import com.bitedash.shared.api.menu.MenuPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MenuPublicServiceImpl implements MenuPublicService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Override
    public boolean isMenuItemAvailable(Long menuItemId) {
        return menuItemRepository.findById(menuItemId)
            .map(item -> !item.getDeleted() && item.getIsAvailable())
            .orElse(false);
    }

    @Override
    public String getMenuItemName(Long menuItemId) {
        return menuItemRepository.findById(menuItemId)
            .map(MenuItem::getName)
            .orElse(null);
    }

    @Override
    public boolean menuItemExists(Long menuItemId) {
        return menuItemRepository.findById(menuItemId)
            .map(item -> !item.getDeleted())
            .orElse(false);
    }
}
