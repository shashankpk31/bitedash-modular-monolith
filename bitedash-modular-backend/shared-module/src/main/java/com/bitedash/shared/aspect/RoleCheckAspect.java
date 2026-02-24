package com.bitedash.shared.aspect;

import com.bitedash.shared.annotation.RequireRole;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.util.UserContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class RoleCheckAspect {

    @Before("@annotation(requireRole)")
    public void checkRole(RequireRole requireRole) {
        UserContext.UserContextHolder context = UserContext.get();

        if (context == null) {
            log.error("Role check failed: No authentication context found");
            throw new RuntimeException("Access Denied: Authentication required");
        }

        String userRole = context.role(); // This returns a String like "ROLE_SUPER_ADMIN"

        // Check if user's role matches any of the required roles (exact match only)
        boolean hasRequiredRole = false;
        for (Object allowedRoleObj : requireRole.value()) {
            if (allowedRoleObj instanceof Role) {
                Role allowedRole = (Role) allowedRoleObj;
                // Convert Role enum to String for comparison
                if (userRole.equals(allowedRole.name()) || userRole.equals(allowedRole.toString())) {
                    hasRequiredRole = true;
                    break;
                }
            }
        }

        if (!hasRequiredRole) {
            log.error("Role check failed: User has role {} but requires one of {}",
                userRole, requireRole.value());
            throw new RuntimeException("Access Denied: Insufficient permissions");
        }
    }
}
