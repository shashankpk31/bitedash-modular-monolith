package com.bitedash.identity.service;

import com.bitedash.identity.entity.IdentityAuditLog;
import com.bitedash.identity.repository.IdentityAuditLogRepository;
import com.bitedash.shared.util.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    @Autowired
    private IdentityAuditLogRepository auditLogRepository;

    /**
     * Log audit entry asynchronously
     * @param entityName Entity type (e.g., "User", "Role")
     * @param entityId Entity ID
     * @param action Action performed (e.g., "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT")
     * @param details Additional details (JSON or text)
     */
    @Async
    public void logAudit(String entityName, String entityId, String action, String details) {
        try {
            String changedBy = "SYSTEM";
            try {
                var userContext = UserContext.get();
                if (userContext != null && userContext.userId() != null) {
                    changedBy = userContext.userId().toString();
                }
            } catch (Exception e) {
                // UserContext not available (e.g., during login/register)
                log.debug("UserContext not available for audit log");
            }

            IdentityAuditLog auditLog = new IdentityAuditLog();
            auditLog.setEntityName(entityName);
            auditLog.setEntityId(entityId);
            auditLog.setAction(action);
            auditLog.setChangedBy(changedBy);
            auditLog.setTimestamp(LocalDateTime.now());
            auditLog.setDetails(details);

            auditLogRepository.save(auditLog);
            log.info("Audit log created: {} {} by {} on {} {}", action, entityName, changedBy, entityName, entityId);
        } catch (Exception e) {
            log.error("Failed to log audit entry: {}", e.getMessage(), e);
            // Don't fail the main operation if audit logging fails
        }
    }

    /**
     * Log user registration
     */
    public void logUserRegistration(Long userId, String email, String role) {
        String details = String.format("{\"email\":\"%s\",\"role\":\"%s\"}", email, role);
        logAudit("User", userId.toString(), "REGISTER", details);
    }

    /**
     * Log user login
     */
    public void logUserLogin(Long userId, String email, boolean success) {
        String details = String.format("{\"email\":\"%s\",\"success\":%b}", email, success);
        logAudit("User", userId.toString(), success ? "LOGIN_SUCCESS" : "LOGIN_FAILED", details);
    }

    /**
     * Log user status change
     */
    public void logUserStatusChange(Long userId, String oldStatus, String newStatus, String reason) {
        String details = String.format("{\"oldStatus\":\"%s\",\"newStatus\":\"%s\",\"reason\":\"%s\"}",
            oldStatus, newStatus, reason != null ? reason : "");
        logAudit("User", userId.toString(), "STATUS_CHANGE", details);
    }

    /**
     * Log password change
     */
    public void logPasswordChange(Long userId, String email) {
        String details = String.format("{\"email\":\"%s\"}", email);
        logAudit("User", userId.toString(), "PASSWORD_CHANGE", details);
    }

    /**
     * Log OTP verification
     */
    public void logOtpVerification(String identifier, boolean success) {
        String details = String.format("{\"identifier\":\"%s\",\"success\":%b}", maskIdentifier(identifier), success);
        logAudit("OTP", identifier, success ? "VERIFY_SUCCESS" : "VERIFY_FAILED", details);
    }

    /**
     * Mask sensitive identifier for logging (show only last 4 chars)
     */
    private String maskIdentifier(String identifier) {
        if (identifier == null || identifier.length() <= 4) {
            return "***";
        }
        return "***" + identifier.substring(identifier.length() - 4);
    }
}
