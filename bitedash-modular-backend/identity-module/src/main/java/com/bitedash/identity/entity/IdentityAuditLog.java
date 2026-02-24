package com.bitedash.identity.entity;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_log", schema = "identity_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IdentityAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String entityName;
    private String entityId;
    private String action;
    private String changedBy;
    private LocalDateTime timestamp;
    @Column(columnDefinition = "TEXT")
    private String details;
}
