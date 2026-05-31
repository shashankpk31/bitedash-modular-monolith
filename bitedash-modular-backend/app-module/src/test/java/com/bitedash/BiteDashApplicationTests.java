package com.bitedash;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Main application context load test.
 * WHY: Verifies that all Spring beans wire correctly and the application can start.
 */
@SpringBootTest
@ActiveProfiles("test")
class BiteDashApplicationTests {

    @Test
    void contextLoads() {
        // WHY: If this test passes, it confirms all @Configuration classes,
        // @Component beans, and dependency injection work correctly.
    }
}
