package com.bitedash.identity.repository;

import com.bitedash.identity.entity.User;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByPhoneNumber(String phoneNumber);
    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    List<User> findByRoleAndStatus(Role role, UserStatus status);
    long countByRoleAndStatus(Role role, UserStatus status);

    List<User> findByOrganizationId(Long organizationId);
    long countByOrganizationId(Long organizationId);

    List<User> findByStatus(UserStatus status);
    List<User> findByStatusAndOrganizationId(UserStatus status, Long organizationId);
}
