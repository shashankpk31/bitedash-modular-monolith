package com.bitedash.organisation.service;

import com.bitedash.organisation.dto.request.LocationRequest;
import com.bitedash.organisation.dto.request.OfficeRequest;
import com.bitedash.organisation.dto.response.DashboardStatsResponse;
import com.bitedash.organisation.dto.response.LocationResponse;
import com.bitedash.organisation.dto.response.OfficeResponse;
import com.bitedash.organisation.entity.Location;
import com.bitedash.organisation.entity.Office;
import com.bitedash.organisation.entity.Organization;
import com.bitedash.organisation.mapper.LocationMapper;
import com.bitedash.organisation.mapper.OfficeMapper;
import com.bitedash.organisation.repository.CafeteriaRepository;
import com.bitedash.organisation.repository.LocationRepository;
import com.bitedash.organisation.repository.OfficeRepository;
import com.bitedash.organisation.repository.OrganizationRepository;
import com.bitedash.shared.util.UserContext;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Comprehensive tests for LocationService.
 * Tests cover: Location CRUD, Office CRUD, Dashboard stats.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("LocationService Tests")
class LocationServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private OfficeRepository officeRepository;

    @Mock
    private CafeteriaRepository cafeteriaRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private LocationMapper locationMapper;

    @Mock
    private OfficeMapper officeMapper;

    @InjectMocks
    private LocationService locationService;

    private MockedStatic<UserContext> userContextMock;

    private Location testLocation;
    private LocationResponse testLocationResponse;
    private Office testOffice;
    private OfficeResponse testOfficeResponse;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        testOrg = new Organization();
        testOrg.setId(1L);
        testOrg.setName("TechCorp");

        testLocation = new Location();
        testLocation.setId(1L);
        testLocation.setCityName("Bangalore");
        testLocation.setState("Karnataka");
        testLocation.setOrganization(testOrg);

        testLocationResponse = new LocationResponse();
        testLocationResponse.setId(1L);
        testLocationResponse.setCityName("Bangalore");
        testLocationResponse.setState("Karnataka");

        testOffice = new Office();
        testOffice.setId(1L);
        testOffice.setOfficeName("Main Office");
        testOffice.setLocation(testLocation);

        testOfficeResponse = new OfficeResponse();
        testOfficeResponse.setId(1L);
        testOfficeResponse.setOfficeName("Main Office");
    }

    @AfterEach
    void tearDown() {
        if (userContextMock != null) {
            userContextMock.close();
        }
    }

    private void mockUserContext(Long userId, String role, Long orgId) {
        userContextMock = mockStatic(UserContext.class);
        UserContext.UserContextHolder holder = new UserContext.UserContextHolder(
            "token", userId, "user@test.com", role, orgId, 1L);
        userContextMock.when(UserContext::get).thenReturn(holder);
    }

    @Nested
    @DisplayName("Create Location Tests")
    class CreateLocationTests {

        @Test
        @DisplayName("Should create location for org admin")
        void saveLocation_OrgAdmin_CreatesLocation() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 1L);
            LocationRequest request = new LocationRequest("Bangalore", "Karnataka", null);

            when(organizationRepository.existsById(1L)).thenReturn(true);
            when(locationMapper.toEntity(request)).thenReturn(testLocation);
            when(organizationRepository.getReferenceById(1L)).thenReturn(testOrg);
            when(locationRepository.save(any(Location.class))).thenReturn(testLocation);
            when(locationMapper.toResponse(testLocation)).thenReturn(testLocationResponse);

            LocationResponse response = locationService.saveLocation(request);

            assertThat(response).isNotNull();
            assertThat(response.getCityName()).isEqualTo("Bangalore");
            verify(locationRepository).save(any(Location.class));
        }

        @Test
        @DisplayName("Should create location for super admin with specified org")
        void saveLocation_SuperAdmin_CreatesForAnyOrg() {
            mockUserContext(1L, "ROLE_SUPER_ADMIN", null);
            LocationRequest request = new LocationRequest("Mumbai", "Maharashtra", 2L);

            when(organizationRepository.existsById(2L)).thenReturn(true);
            when(locationMapper.toEntity(request)).thenReturn(testLocation);
            when(organizationRepository.getReferenceById(2L)).thenReturn(testOrg);
            when(locationRepository.save(any(Location.class))).thenReturn(testLocation);
            when(locationMapper.toResponse(testLocation)).thenReturn(testLocationResponse);

            LocationResponse response = locationService.saveLocation(request);

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should reject org admin creating location for different org")
        void saveLocation_OrgAdmin_DifferentOrg_ThrowsException() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 1L);
            LocationRequest request = new LocationRequest("Mumbai", "Maharashtra", 2L);

            assertThatThrownBy(() -> locationService.saveLocation(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("only create locations for your own organization");
        }

        @Test
        @DisplayName("Should reject when organization does not exist")
        void saveLocation_NonExistingOrg_ThrowsException() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 999L);
            LocationRequest request = new LocationRequest("Bangalore", "Karnataka", null);

            when(organizationRepository.existsById(999L)).thenReturn(false);

            assertThatThrownBy(() -> locationService.saveLocation(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Find Location Tests")
    class FindLocationTests {

        @Test
        @DisplayName("Should return locations by organization ID")
        void findByOrgId_ReturnsLocations() {
            when(organizationRepository.existsById(1L)).thenReturn(true);
            when(locationRepository.findByOrganization_Id(1L)).thenReturn(Arrays.asList(testLocation));
            when(locationMapper.toResponse(anyList())).thenReturn(Arrays.asList(testLocationResponse));
            when(officeRepository.countByLocation_Id(1L)).thenReturn(3L);
            when(cafeteriaRepository.countByOffice_Location_Id(1L)).thenReturn(5L);

            List<LocationResponse> results = locationService.findByOrgId(1L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getOfficeCount()).isEqualTo(3);
            assertThat(results.get(0).getCafeteriaCount()).isEqualTo(5);
        }

        @Test
        @DisplayName("Should return all locations")
        void findAllLocations_ReturnsAll() {
            when(locationRepository.findAll()).thenReturn(Arrays.asList(testLocation));
            when(locationMapper.toResponse(anyList())).thenReturn(Arrays.asList(testLocationResponse));
            when(officeRepository.countByLocation_Id(anyLong())).thenReturn(2L);
            when(cafeteriaRepository.countByOffice_Location_Id(anyLong())).thenReturn(4L);

            List<LocationResponse> results = locationService.findAllLocations();

            assertThat(results).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Update Location Tests")
    class UpdateLocationTests {

        @Test
        @DisplayName("Should update existing location")
        void updateLocation_ExistingId_UpdatesLocation() {
            LocationRequest request = new LocationRequest("Chennai", "Tamil Nadu", null);

            when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));
            when(locationRepository.save(any(Location.class))).thenReturn(testLocation);
            when(locationMapper.toResponse(testLocation)).thenReturn(testLocationResponse);

            LocationResponse response = locationService.updateLocation(1L, request);

            assertThat(response).isNotNull();
            verify(locationRepository).save(any(Location.class));
        }

        @Test
        @DisplayName("Should throw exception for non-existing location")
        void updateLocation_NonExisting_ThrowsException() {
            LocationRequest request = new LocationRequest("Chennai", "Tamil Nadu", null);

            when(locationRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> locationService.updateLocation(999L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Delete Location Tests")
    class DeleteLocationTests {

        @Test
        @DisplayName("Should soft delete existing location")
        void deleteLocation_ExistingId_SoftDeletes() {
            when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));
            when(locationRepository.save(any(Location.class))).thenReturn(testLocation);

            locationService.deleteLocation(1L);

            assertThat(testLocation.getDeleted()).isTrue();
            verify(locationRepository).save(testLocation);
        }
    }

    @Nested
    @DisplayName("Office Tests")
    class OfficeTests {

        @Test
        @DisplayName("Should create office for location")
        void createOffice_ValidRequest_CreatesOffice() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 1L);
            OfficeRequest request = new OfficeRequest(
                1L,              // locationId
                "Main Office",   // officeName
                "123 Street",    // address
                5                // totalFloors
            );

            when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));
            when(officeMapper.toEntity(request)).thenReturn(testOffice);
            when(officeRepository.save(any(Office.class))).thenReturn(testOffice);
            when(officeMapper.toResponse(testOffice)).thenReturn(testOfficeResponse);

            OfficeResponse response = locationService.createOffice(request);

            assertThat(response).isNotNull();
            assertThat(response.getOfficeName()).isEqualTo("Main Office");
        }

        @Test
        @DisplayName("Should reject office creation for non-existing location")
        void createOffice_NonExistingLocation_ThrowsException() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 1L);
            OfficeRequest request = new OfficeRequest(
                999L,            // locationId
                "Main Office",   // officeName
                "123 Street",    // address
                5                // totalFloors
            );

            when(locationRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> locationService.createOffice(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should return offices by location")
        void getOfficesByLocation_ReturnsOffices() {
            when(locationRepository.existsById(1L)).thenReturn(true);
            when(officeRepository.findByLocation_Id(1L)).thenReturn(Arrays.asList(testOffice));
            when(officeMapper.toResponse(anyList())).thenReturn(Arrays.asList(testOfficeResponse));
            when(cafeteriaRepository.countByOffice_Id(1L)).thenReturn(2L);

            List<OfficeResponse> results = locationService.getOfficesByLocation(1L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getCafeteriaCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should update existing office")
        void updateOffice_ValidRequest_UpdatesOffice() {
            OfficeRequest request = new OfficeRequest(
                1L,                // locationId
                "Updated Office",  // officeName
                "456 Avenue",      // address
                10                 // totalFloors
            );

            when(officeRepository.findById(1L)).thenReturn(Optional.of(testOffice));
            when(officeRepository.save(any(Office.class))).thenReturn(testOffice);
            when(officeMapper.toResponse(testOffice)).thenReturn(testOfficeResponse);

            OfficeResponse response = locationService.updateOffice(1L, request);

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should soft delete existing office")
        void deleteOffice_ExistingId_SoftDeletes() {
            when(officeRepository.findById(1L)).thenReturn(Optional.of(testOffice));
            when(officeRepository.save(any(Office.class))).thenReturn(testOffice);

            locationService.deleteOffice(1L);

            assertThat(testOffice.getDeleted()).isTrue();
        }
    }

    @Nested
    @DisplayName("Dashboard Stats Tests")
    class DashboardStatsTests {

        @Test
        @DisplayName("Should return stats for org admin")
        void getDashboardStats_OrgAdmin_ReturnsOrgStats() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 1L);

            when(organizationRepository.existsById(1L)).thenReturn(true);
            when(locationRepository.countByOrganization_Id(1L)).thenReturn(5L);
            when(officeRepository.countByLocation_Organization_Id(1L)).thenReturn(10L);
            when(cafeteriaRepository.countByOffice_Location_Organization_Id(1L)).thenReturn(15L);

            DashboardStatsResponse stats = locationService.getDashboardStats();

            assertThat(stats.getLocations()).isEqualTo(5);
            assertThat(stats.getOffices()).isEqualTo(10);
            assertThat(stats.getCafeterias()).isEqualTo(15);
        }

        @Test
        @DisplayName("Should return aggregated stats for super admin")
        void getDashboardStats_SuperAdmin_ReturnsAllStats() {
            mockUserContext(1L, "ROLE_SUPER_ADMIN", null);

            when(locationRepository.count()).thenReturn(20L);
            when(officeRepository.count()).thenReturn(50L);
            when(cafeteriaRepository.count()).thenReturn(100L);

            DashboardStatsResponse stats = locationService.getDashboardStats();

            assertThat(stats.getLocations()).isEqualTo(20);
            assertThat(stats.getOffices()).isEqualTo(50);
            assertThat(stats.getCafeterias()).isEqualTo(100);
        }
    }
}
