package com.bitedash.order.config;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

/**
 * Minimal Spring Boot test configuration for order-module tests.
 *
 * Why: @WebMvcTest requires a @SpringBootConfiguration to bootstrap the test context.
 * Since order-module is a library module without its own @SpringBootApplication,
 * we provide this minimal configuration for testing purposes only.
 *
 * This configuration:
 * - Enables Spring Boot auto-configuration
 * - Scans for components in com.bitedash.order package
 * - Provides the necessary context for @WebMvcTest and other Spring tests
 */
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(basePackages = "com.bitedash.order")
public class TestApplication {
    // Minimal configuration - no beans needed for controller tests
}
