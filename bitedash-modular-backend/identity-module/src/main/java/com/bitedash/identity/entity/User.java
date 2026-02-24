package com.bitedash.identity.entity;

import com.bitedash.shared.entity.BaseEntity;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users", schema = "identity_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = true)
    private String employeeId;

    @Column(nullable = true)
    private Long organizationId;

    @Column(nullable = true)
    private String shopName;

    @Column(nullable = true)
    private String gstNumber;

    @Column(nullable = true)
    private String phoneNumber;

    @Column(nullable = true)
    private Boolean emailVerified;

    @Column(nullable = true)
    private Boolean phoneVerified;

    @Column(nullable = true)
    private Long officeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private UserStatus status;

    @Column(nullable = true)
    private Boolean profileComplete;
}
