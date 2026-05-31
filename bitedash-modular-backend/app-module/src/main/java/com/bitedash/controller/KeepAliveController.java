package com.bitedash.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Keep-Alive Controller for Render Free Tier
 *
 * WHY: Render free tier spins down after 15 minutes of inactivity.
 *      This endpoint is pinged by external cron service every 14 minutes
 *      to keep the application awake.
 *
 * SETUP: Use UptimeRobot (free) or cron-job.org
 *        Configure to GET https://your-app.onrender.com/api/keep-alive every 14 minutes
 *
 * SECURITY: Public endpoint, no auth required (intentional for monitoring)
 */
@RestController
@RequestMapping("/api")
public class KeepAliveController {

    @GetMapping("/keep-alive")
    public ResponseEntity<Map<String, Object>> keepAlive() {
        return ResponseEntity.ok(Map.of(
            "status", "alive",
            "timestamp", Instant.now().toString(),
            "message", "BiteDash is running"
        ));
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
