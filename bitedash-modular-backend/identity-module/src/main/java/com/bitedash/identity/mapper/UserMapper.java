package com.bitedash.identity.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.bitedash.identity.dto.RegisterOrgRequest;
import com.bitedash.identity.dto.RegisterRequest;
import com.bitedash.identity.dto.UserResponse;
import com.bitedash.identity.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "phoneVerified", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "profileComplete", ignore = true)
    User toEntity(RegisterRequest request);

    @Mapping(source = "emailVerified", target = "isEmailVerified")
    @Mapping(source = "phoneVerified", target = "isPhoneVerified")
    @Mapping(source = "profileComplete", target = "isProfileComplete")
    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "phoneVerified", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "profileComplete", ignore = true)
    User toEntity(RegisterOrgRequest request);
}
