package com.bitedash.identity.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bitedash.identity.dto.UserResponse;
import com.bitedash.identity.mapper.UserMapper;
import com.bitedash.identity.repository.UserRepository;
import com.bitedash.shared.dto.ApiResponse;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;
import com.bitedash.shared.util.UserContext;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping(path = "/{id}")
    public ResponseEntity<ApiResponse> getUser(@PathVariable Long id) {
        // SECURITY: Prevent IDOR - users can only access their own profile unless admin
        var context = UserContext.get();
        Long currentUserId = context.userId();
        String currentRole = context.role();

        boolean isAdmin = "ROLE_SUPER_ADMIN".equals(currentRole) || "ROLE_ORG_ADMIN".equals(currentRole);
        if (!isAdmin && !id.equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You can only access your own profile"));
        }

        UserResponse response = userMapper.toResponse(
                userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found")));
        return ResponseEntity.ok(ApiResponse.success("User found", response));
    }

    @GetMapping("/pending-vendors/count")
    public ResponseEntity<ApiResponse> getPendingVendorsCount() {
        Integer count = (int) userRepository.countByRoleAndStatus(Role.ROLE_VENDOR, UserStatus.PENDING_APPROVAL);
        return ResponseEntity.ok(ApiResponse.success("Count retrieved", count));
    }
}
