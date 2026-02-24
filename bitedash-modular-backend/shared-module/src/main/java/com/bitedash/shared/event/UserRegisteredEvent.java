package com.bitedash.shared.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when a new user registers
 * Used to trigger OTP verification notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {
    private Long userId;
    private String email; // Can be email or phone number (identifier)
    private String name;
    private String role;
}
