package com.bitedash.shared.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when a vendor is approved by super admin
 * Used to trigger vendor approval notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorApprovedEvent {
    private Long vendorId;
    private Long userId;
    private String userEmail;
    private String vendorName;
    private String userName;
}
