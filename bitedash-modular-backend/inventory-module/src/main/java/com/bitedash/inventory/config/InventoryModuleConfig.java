package com.bitedash.inventory.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Inventory Module
 * This enables component scanning
 * JPA repositories and entities are configured centrally in BiteDashApplication
 */
@Configuration
@ComponentScan(basePackages = "com.bitedash.inventory")
public class InventoryModuleConfig {
    // Configuration for Inventory Module
}
