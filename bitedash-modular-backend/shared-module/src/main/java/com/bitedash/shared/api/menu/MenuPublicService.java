package com.bitedash.shared.api.menu;

/**
 * Public API for menu-module.
 * This interface is in shared-module to avoid circular dependencies.
 * Implementation is in menu-module.
 */
public interface MenuPublicService {

    /**
     * Check if menu item exists and is available for ordering
     * @param menuItemId Menu item ID
     * @return true if exists, not deleted, and available
     */
    boolean isMenuItemAvailable(Long menuItemId);

    /**
     * Get menu item name by ID
     * @param menuItemId Menu item ID
     * @return Menu item name or null if not found
     */
    String getMenuItemName(Long menuItemId);

    /**
     * Check if menu item exists
     * @param menuItemId Menu item ID
     * @return true if exists and not deleted
     */
    boolean menuItemExists(Long menuItemId);
}
