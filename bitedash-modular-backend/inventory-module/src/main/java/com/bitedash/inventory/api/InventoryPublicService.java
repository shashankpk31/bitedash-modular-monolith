package com.bitedash.inventory.api;

/**
 * Public API for Inventory Module
 * This interface defines methods that can be called by other modules
 * for cross-module communication in the modular monolith architecture.
 */
public interface InventoryPublicService {

    /**
     * Check if sufficient stock is available for a given inventory item
     * @param inventoryItemId The ID of the inventory item
     * @param quantity The quantity to check
     * @return true if sufficient stock is available, false otherwise
     */
    boolean checkStock(Long inventoryItemId, Integer quantity);

    /**
     * Deduct stock from an inventory item
     * @param inventoryItemId The ID of the inventory item
     * @param quantity The quantity to deduct
     * @throws RuntimeException if insufficient stock or item not found
     */
    void deductStock(Long inventoryItemId, Integer quantity);

    /**
     * Add stock to an inventory item
     * @param inventoryItemId The ID of the inventory item
     * @param quantity The quantity to add
     */
    void addStock(Long inventoryItemId, Integer quantity);

    /**
     * Reserve stock for an order (reduces available, increases reserved)
     * @param inventoryItemId The ID of the inventory item
     * @param quantity The quantity to reserve
     * @throws RuntimeException if insufficient available stock
     */
    void reserveStock(Long inventoryItemId, Integer quantity);

    /**
     * Release reserved stock (moves from reserved back to available)
     * @param inventoryItemId The ID of the inventory item
     * @param quantity The quantity to release
     */
    void releaseReservedStock(Long inventoryItemId, Integer quantity);

    /**
     * Get the available quantity for an inventory item
     * @param inventoryItemId The ID of the inventory item
     * @return The available quantity, or 0 if item not found
     */
    Integer getAvailableQuantity(Long inventoryItemId);
}
