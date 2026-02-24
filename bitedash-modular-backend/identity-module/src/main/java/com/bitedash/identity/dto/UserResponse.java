package com.bitedash.identity.dto;

import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private Role role;
    private String employeeId;
    private Long organizationId;
    private String shopName;
    private String gstNumber;
    private String phoneNumber;
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private Long officeId;
    private UserStatus status;
    private Boolean isProfileComplete;
}
