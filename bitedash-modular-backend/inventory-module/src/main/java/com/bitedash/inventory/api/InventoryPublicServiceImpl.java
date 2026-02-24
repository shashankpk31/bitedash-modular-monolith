package com.bitedash.inventory.api;

import com.bitedash.inventory.entity.InventoryItem;
import com.bitedash.inventory.repository.InventoryItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of Inventory Public API
 * This service is accessible by other modules for cross-module communication
 */
@Service
public class InventoryPublicServiceImpl implements InventoryPublicService {

    private static final Logger log = LoggerFactory.getLogger(InventoryPublicServiceImpl.class);

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean checkStock(Long inventoryItemId, Integer quantity) {
        log.debug("Checking stock for inventory item: {} with quantity: {}", inventoryItemId, quantity);

        return inventoryItemRepository.findById(inventoryItemId)
            .map(item -> item.getAvailableQuantity() >= quantity)
            .orElse(false);
    }

    @Override
    @Transactional
    public void deductStock(Long inventoryItemId, Integer quantity) {
        log.info("Deducting stock for inventory item: {} with quantity: {}", inventoryItemId, quantity);

        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found: " + inventoryItemId));

        if (item.getAvailableQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for inventory item: " + inventoryItemId);
        }

        item.setAvailableQuantity(item.getAvailableQuantity() - quantity);
        inventoryItemRepository.save(item);

        log.info("Stock deducted successfully. New available quantity: {}", item.getAvailableQuantity());
    }

    @Override
    @Transactional
    public void addStock(Long inventoryItemId, Integer quantity) {
        log.info("Adding stock for inventory item: {} with quantity: {}", inventoryItemId, quantity);

        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found: " + inventoryItemId));

        item.setAvailableQuantity(item.getAvailableQuantity() + quantity);
        inventoryItemRepository.save(item);

        log.info("Stock added successfully. New available quantity: {}", item.getAvailableQuantity());
    }

    @Override
    @Transactional
    public void reserveStock(Long inventoryItemId, Integer quantity) {
        log.info("Reserving stock for inventory item: {} with quantity: {}", inventoryItemId, quantity);

        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found: " + inventoryItemId));

        if (item.getAvailableQuantity() < quantity) {
            throw new RuntimeException("Insufficient available stock for inventory item: " + inventoryItemId);
        }

        item.setAvailableQuantity(item.getAvailableQuantity() - quantity);
        item.setReservedQuantity(item.getReservedQuantity() + quantity);
        inventoryItemRepository.save(item);

        log.info("Stock reserved successfully. Available: {}, Reserved: {}",
            item.getAvailableQuantity(), item.getReservedQuantity());
    }

    @Override
    @Transactional
    public void releaseReservedStock(Long inventoryItemId, Integer quantity) {
        log.info("Releasing reserved stock for inventory item: {} with quantity: {}", inventoryItemId, quantity);

        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found: " + inventoryItemId));

        if (item.getReservedQuantity() < quantity) {
            log.warn("Attempting to release more stock than reserved. Adjusting to reserved quantity.");
            quantity = item.getReservedQuantity();
        }

        item.setReservedQuantity(item.getReservedQuantity() - quantity);
        item.setAvailableQuantity(item.getAvailableQuantity() + quantity);
        inventoryItemRepository.save(item);

        log.info("Reserved stock released successfully. Available: {}, Reserved: {}",
            item.getAvailableQuantity(), item.getReservedQuantity());
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getAvailableQuantity(Long inventoryItemId) {
        log.debug("Getting available quantity for inventory item: {}", inventoryItemId);

        return inventoryItemRepository.findById(inventoryItemId)
            .map(InventoryItem::getAvailableQuantity)
            .orElse(0);
    }
}
