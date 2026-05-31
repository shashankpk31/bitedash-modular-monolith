package com.bitedash.organisation.service;

import com.bitedash.organisation.dto.request.OrganizationRequest;
import com.bitedash.organisation.dto.response.OrgAdminStatsResponse;
import com.bitedash.organisation.dto.response.OrganizationResponse;
import com.bitedash.organisation.dto.response.SuperAdminStatsResponse;
import com.bitedash.organisation.entity.Organization;
import com.bitedash.organisation.mapper.OrganizationMapper;
import com.bitedash.organisation.repository.LocationRepository;
import com.bitedash.organisation.repository.OrganizationRepository;
import com.bitedash.organisation.repository.VendorRepository;
import com.bitedash.shared.api.identity.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Comprehensive tests for OrganizationService.
 * Tests cover: Create, Read, Delete organizations and stats retrieval.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrganizationService Tests")
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationMapper organizationMapper;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private OrganizationService organizationService;

    private Organization testOrg;
    private OrganizationResponse testOrgResponse;

    @BeforeEach
    void setUp() {
        testOrg = new Organization();
        testOrg.setId(1L);
        testOrg.setName("TechCorp Inc.");
        testOrg.setDomain("techcorp.com");

        testOrgResponse = new OrganizationResponse();
        testOrgResponse.setId(1L);
        testOrgResponse.setName("TechCorp Inc.");
    }

    @Nested
    @DisplayName("Create Organization Tests")
    class CreateOrganizationTests {

        @Test
        @DisplayName("Should create organization successfully")
        void createOrganization_ValidRequest_ReturnsResponse() {
            OrganizationRequest request = new OrganizationRequest("TechCorp Inc.", "A tech company");

            when(organizationMapper.toEntity(request)).thenReturn(testOrg);
            when(organizationRepository.save(testOrg)).thenReturn(testOrg);
            when(organizationMapper.toResponse(testOrg)).thenReturn(testOrgResponse);

            OrganizationResponse response = organizationService.createOrganization(request);

            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("TechCorp Inc.");
            verify(organizationRepository).save(testOrg);
        }
    }

    @Nested
    @DisplayName("Find Organization Tests")
    class FindOrganizationTests {

        @Test
        @DisplayName("Should return all organizations")
        void findAllOrganisations_ReturnsAllOrgs() {
            Organization org2 = new Organization();
            org2.setId(2L);
            org2.setName("FoodCo");

            OrganizationResponse response2 = new OrganizationResponse();
            response2.setId(2L);
            response2.setName("FoodCo");

            when(organizationRepository.findAll()).thenReturn(Arrays.asList(testOrg, org2));
            when(organizationMapper.toResponse(anyList())).thenReturn(Arrays.asList(testOrgResponse, response2));

            List<OrganizationResponse> results = organizationService.findAllOrganisations();

            assertThat(results).hasSize(2);
            verify(organizationRepository).findAll();
        }

        @Test
        @DisplayName("Should return organization by ID")
        void findOrganizationById_ExistingId_ReturnsOrg() {
            when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrg));
            when(organizationMapper.toResponse(testOrg)).thenReturn(testOrgResponse);

            OrganizationResponse response = organizationService.findOrganizationById(1L);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should throw exception when organization not found")
        void findOrganizationById_NonExistingId_ThrowsException() {
            when(organizationRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> organizationService.findOrganizationById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Delete Organization Tests")
    class DeleteOrganizationTests {

        @Test
        @DisplayName("Should delete existing organization")
        void deleteOrganization_ExistingId_DeletesOrg() {
            when(organizationRepository.existsById(1L)).thenReturn(true);

            organizationService.deleteOrganization(1L);

            verify(organizationRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Should not throw when deleting non-existing organization")
        void deleteOrganization_NonExistingId_NoException() {
            when(organizationRepository.existsById(999L)).thenReturn(false);

            organizationService.deleteOrganization(999L);

            verify(organizationRepository, never()).deleteById(999L);
        }
    }

    @Nested
    @DisplayName("Super Admin Stats Tests")
    class SuperAdminStatsTests {

        @Test
        @DisplayName("Should return platform-wide statistics")
        void getSuperAdminStats_ReturnsAllStats() {
            when(organizationRepository.count()).thenReturn(5L);
            when(locationRepository.count()).thenReturn(10L);
            when(vendorRepository.count()).thenReturn(20L);
            when(userService.countPendingVendors()).thenReturn(3);
            when(userService.countAllUsers()).thenReturn(100);

            SuperAdminStatsResponse stats = organizationService.getSuperAdminStats();

            assertThat(stats.getTotalOrganizations()).isEqualTo(5);
            assertThat(stats.getTotalLocations()).isEqualTo(10);
            assertThat(stats.getTotalVendors()).isEqualTo(20);
            assertThat(stats.getPendingVendors()).isEqualTo(3);
            assertThat(stats.getTotalUsers()).isEqualTo(100);
        }

        @Test
        @DisplayName("Should handle user service failure gracefully")
        void getSuperAdminStats_UserServiceFails_ReturnsPartialStats() {
            when(organizationRepository.count()).thenReturn(5L);
            when(locationRepository.count()).thenReturn(10L);
            when(vendorRepository.count()).thenReturn(20L);
            when(userService.countPendingVendors()).thenThrow(new RuntimeException("Service unavailable"));

            SuperAdminStatsResponse stats = organizationService.getSuperAdminStats();

            assertThat(stats.getTotalOrganizations()).isEqualTo(5);
            assertThat(stats.getPendingVendors()).isEqualTo(0); // Default when service fails
        }
    }

    @Nested
    @DisplayName("Org Admin Stats Tests")
    class OrgAdminStatsTests {

        @Test
        @DisplayName("Should return organization-specific statistics")
        void getOrgAdminStats_ValidOrgId_ReturnsStats() {
            when(organizationRepository.existsById(1L)).thenReturn(true);
            when(userService.countEmployeesByOrganization(1L)).thenReturn(50);
            when(vendorRepository.countByIsActiveTrue()).thenReturn(10L);
            when(locationRepository.countByOrganization_Id(1L)).thenReturn(5L);

            OrgAdminStatsResponse stats = organizationService.getOrgAdminStats(1L);

            assertThat(stats.getTotalEmployees()).isEqualTo(50);
            assertThat(stats.getActiveVendors()).isEqualTo(10);
            assertThat(stats.getTotalLocations()).isEqualTo(5);
        }

        @Test
        @DisplayName("Should throw exception for non-existing organization")
        void getOrgAdminStats_InvalidOrgId_ThrowsException() {
            when(organizationRepository.existsById(999L)).thenReturn(false);

            assertThatThrownBy(() -> organizationService.getOrgAdminStats(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }
}
