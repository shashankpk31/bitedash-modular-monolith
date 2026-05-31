package com.bitedash.organisation.service;

import com.bitedash.organisation.dto.request.CafeteriaRequest;
import com.bitedash.organisation.dto.response.CafeteriaResponse;
import com.bitedash.organisation.entity.Cafeteria;
import com.bitedash.organisation.entity.Location;
import com.bitedash.organisation.entity.Office;
import com.bitedash.organisation.entity.Organization;
import com.bitedash.organisation.mapper.CafeteriaMapper;
import com.bitedash.organisation.repository.CafeteriaRepository;
import com.bitedash.organisation.repository.OfficeRepository;
import com.bitedash.shared.util.UserContext;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Comprehensive tests for CafeteriaService.
 * Tests cover: Cafeteria CRUD, organization hierarchy validation, soft delete.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CafeteriaService Tests")
class CafeteriaServiceTest {

    @Mock
    private CafeteriaRepository cafeteriaRepository;

    @Mock
    private OfficeRepository officeRepository;

    @Mock
    private CafeteriaMapper cafeteriaMapper;

    @InjectMocks
    private CafeteriaService cafeteriaService;

    private MockedStatic<UserContext> userContextMock;

    private Office testOffice;
    private Location testLocation;
    private Organization testOrg;
    private Cafeteria testCafeteria;
    private CafeteriaResponse testCafeteriaResponse;

    @BeforeEach
    void setUp() {
        testOrg = new Organization();
        testOrg.setId(1L);
        testOrg.setName("TechCorp");

        testLocation = new Location();
        testLocation.setId(1L);
        testLocation.setCityName("Bangalore");
        testLocation.setOrganization(testOrg);

        testOffice = new Office();
        testOffice.setId(1L);
        testOffice.setOfficeName("Main Office");
        testOffice.setLocation(testLocation);

        testCafeteria = new Cafeteria();
        testCafeteria.setId(1L);
        testCafeteria.setName("Ground Floor Cafeteria");
        testCafeteria.setFloorNumber(0);
        testCafeteria.setCapacity(100);
        testCafeteria.setOpeningTime(LocalTime.of(8, 0));
        testCafeteria.setClosingTime(LocalTime.of(20, 0));
        testCafeteria.setOffice(testOffice);
        testCafeteria.setIsActive(true);

        testCafeteriaResponse = new CafeteriaResponse();
        testCafeteriaResponse.setId(1L);
        testCafeteriaResponse.setName("Ground Floor Cafeteria");
        testCafeteriaResponse.setFloorNumber(0);
        testCafeteriaResponse.setCapacity(100);
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
    @DisplayName("Create Cafeteria Tests")
    class CreateCafeteriaTests {

        @Test
        @DisplayName("Should create cafeteria for org admin in own organization")
        void createCafeteria_OrgAdmin_OwnOrg_CreatesCafeteria() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 1L);

            CafeteriaRequest request = new CafeteriaRequest(
                1L,                     // officeId
                "New Cafeteria",        // name
                1,                      // floorNumber
                80,                     // capacity
                LocalTime.of(9, 0),     // openingTime
                LocalTime.of(18, 0)     // closingTime
            );

            when(officeRepository.findById(1L)).thenReturn(Optional.of(testOffice));
            when(cafeteriaMapper.toEntity(request)).thenReturn(testCafeteria);
            when(cafeteriaRepository.save(any(Cafeteria.class))).thenReturn(testCafeteria);
            when(cafeteriaMapper.toResponse(testCafeteria)).thenReturn(testCafeteriaResponse);

            CafeteriaResponse response = cafeteriaService.createCafeteria(request);

            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("Ground Floor Cafeteria");
            verify(cafeteriaRepository).save(any(Cafeteria.class));
        }

        @Test
        @DisplayName("Should create cafeteria for super admin in any organization")
        void createCafeteria_SuperAdmin_CreatesCafeteria() {
            mockUserContext(1L, "ROLE_SUPER_ADMIN", null);

            CafeteriaRequest request = new CafeteriaRequest(
                1L,                     // officeId
                "New Cafeteria",        // name
                1,                      // floorNumber
                80,                     // capacity
                LocalTime.of(9, 0),     // openingTime
                LocalTime.of(18, 0)     // closingTime
            );

            when(officeRepository.findById(1L)).thenReturn(Optional.of(testOffice));
            when(cafeteriaMapper.toEntity(request)).thenReturn(testCafeteria);
            when(cafeteriaRepository.save(any(Cafeteria.class))).thenReturn(testCafeteria);
            when(cafeteriaMapper.toResponse(testCafeteria)).thenReturn(testCafeteriaResponse);

            CafeteriaResponse response = cafeteriaService.createCafeteria(request);

            assertThat(response).isNotNull();
            verify(cafeteriaRepository).save(any(Cafeteria.class));
        }

        @Test
        @DisplayName("Should reject org admin creating cafeteria in different organization")
        void createCafeteria_OrgAdmin_DifferentOrg_ThrowsException() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 2L); // User belongs to org 2

            CafeteriaRequest request = new CafeteriaRequest(
                1L,                     // officeId
                "New Cafeteria",        // name
                1,                      // floorNumber
                80,                     // capacity
                LocalTime.of(9, 0),     // openingTime
                LocalTime.of(18, 0)     // closingTime
            );

            when(officeRepository.findById(1L)).thenReturn(Optional.of(testOffice)); // Office belongs to org 1

            assertThatThrownBy(() -> cafeteriaService.createCafeteria(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("Should reject when office does not exist")
        void createCafeteria_NonExistingOffice_ThrowsException() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", 1L);

            CafeteriaRequest request = new CafeteriaRequest(
                999L,                   // officeId
                "New Cafeteria",        // name
                1,                      // floorNumber
                80,                     // capacity
                LocalTime.of(9, 0),     // openingTime
                LocalTime.of(18, 0)     // closingTime
            );

            when(officeRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cafeteriaService.createCafeteria(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should reject non-super admin without organization ID")
        void createCafeteria_NoOrgId_ThrowsException() {
            mockUserContext(1L, "ROLE_ORG_ADMIN", null);

            CafeteriaRequest request = new CafeteriaRequest(
                1L,                     // officeId
                "New Cafeteria",        // name
                1,                      // floorNumber
                80,                     // capacity
                LocalTime.of(9, 0),     // openingTime
                LocalTime.of(18, 0)     // closingTime
            );

            when(officeRepository.findById(1L)).thenReturn(Optional.of(testOffice));

            assertThatThrownBy(() -> cafeteriaService.createCafeteria(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Organization ID is required");
        }
    }

    @Nested
    @DisplayName("Find Cafeteria Tests")
    class FindCafeteriaTests {

        @Test
        @DisplayName("Should return cafeterias by office ID")
        void findByOfficeId_ReturnsCafeterias() {
            when(officeRepository.existsById(1L)).thenReturn(true);
            when(cafeteriaRepository.findByOffice_Id(1L)).thenReturn(Arrays.asList(testCafeteria));
            when(cafeteriaMapper.toResponse(anyList())).thenReturn(Arrays.asList(testCafeteriaResponse));

            List<CafeteriaResponse> results = cafeteriaService.findByOfficeId(1L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getName()).isEqualTo("Ground Floor Cafeteria");
        }

        @Test
        @DisplayName("Should throw exception for non-existing office")
        void findByOfficeId_NonExistingOffice_ThrowsException() {
            when(officeRepository.existsById(999L)).thenReturn(false);

            assertThatThrownBy(() -> cafeteriaService.findByOfficeId(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should return empty list when no cafeterias in office")
        void findByOfficeId_NoCafeterias_ReturnsEmptyList() {
            when(officeRepository.existsById(1L)).thenReturn(true);
            when(cafeteriaRepository.findByOffice_Id(1L)).thenReturn(Arrays.asList());
            when(cafeteriaMapper.toResponse(anyList())).thenReturn(Arrays.asList());

            List<CafeteriaResponse> results = cafeteriaService.findByOfficeId(1L);

            assertThat(results).isEmpty();
        }
    }

    @Nested
    @DisplayName("Update Cafeteria Tests")
    class UpdateCafeteriaTests {

        @Test
        @DisplayName("Should update existing cafeteria")
        void updateCafeteria_ExistingId_UpdatesCafeteria() {
            CafeteriaRequest request = new CafeteriaRequest(
                1L,                      // officeId
                "Updated Cafeteria",     // name
                2,                       // floorNumber
                150,                     // capacity
                LocalTime.of(7, 0),      // openingTime
                LocalTime.of(22, 0)      // closingTime
            );

            when(cafeteriaRepository.findById(1L)).thenReturn(Optional.of(testCafeteria));
            when(cafeteriaRepository.save(any(Cafeteria.class))).thenReturn(testCafeteria);
            when(cafeteriaMapper.toResponse(testCafeteria)).thenReturn(testCafeteriaResponse);

            CafeteriaResponse response = cafeteriaService.updateCafeteria(1L, request);

            assertThat(response).isNotNull();
            verify(cafeteriaRepository).save(testCafeteria);
            assertThat(testCafeteria.getName()).isEqualTo("Updated Cafeteria");
            assertThat(testCafeteria.getFloorNumber()).isEqualTo(2);
            assertThat(testCafeteria.getCapacity()).isEqualTo(150);
        }

        @Test
        @DisplayName("Should throw exception for non-existing cafeteria")
        void updateCafeteria_NonExisting_ThrowsException() {
            CafeteriaRequest request = new CafeteriaRequest(
                1L,                      // officeId
                "Updated Cafeteria",     // name
                2,                       // floorNumber
                150,                     // capacity
                LocalTime.of(7, 0),      // openingTime
                LocalTime.of(22, 0)      // closingTime
            );

            when(cafeteriaRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cafeteriaService.updateCafeteria(999L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Update Status Tests")
    class UpdateStatusTests {

        @Test
        @DisplayName("Should activate cafeteria")
        void updateStatus_Activate_UpdatesStatus() {
            testCafeteria.setIsActive(false);

            when(cafeteriaRepository.findById(1L)).thenReturn(Optional.of(testCafeteria));
            when(cafeteriaRepository.save(any(Cafeteria.class))).thenReturn(testCafeteria);
            when(cafeteriaMapper.toResponse(testCafeteria)).thenReturn(testCafeteriaResponse);

            CafeteriaResponse response = cafeteriaService.updateStatus(1L, true);

            assertThat(response).isNotNull();
            assertThat(testCafeteria.getIsActive()).isTrue();
        }

        @Test
        @DisplayName("Should deactivate cafeteria")
        void updateStatus_Deactivate_UpdatesStatus() {
            when(cafeteriaRepository.findById(1L)).thenReturn(Optional.of(testCafeteria));
            when(cafeteriaRepository.save(any(Cafeteria.class))).thenReturn(testCafeteria);
            when(cafeteriaMapper.toResponse(testCafeteria)).thenReturn(testCafeteriaResponse);

            CafeteriaResponse response = cafeteriaService.updateStatus(1L, false);

            assertThat(response).isNotNull();
            assertThat(testCafeteria.getIsActive()).isFalse();
        }

        @Test
        @DisplayName("Should throw exception for non-existing cafeteria")
        void updateStatus_NonExisting_ThrowsException() {
            when(cafeteriaRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cafeteriaService.updateStatus(999L, true))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Delete Cafeteria Tests")
    class DeleteCafeteriaTests {

        @Test
        @DisplayName("Should soft delete existing cafeteria")
        void deleteCafeteria_ExistingId_SoftDeletes() {
            when(cafeteriaRepository.findById(1L)).thenReturn(Optional.of(testCafeteria));
            when(cafeteriaRepository.save(any(Cafeteria.class))).thenReturn(testCafeteria);

            cafeteriaService.deleteCafeteria(1L);

            assertThat(testCafeteria.getDeleted()).isTrue();
            verify(cafeteriaRepository).save(testCafeteria);
        }

        @Test
        @DisplayName("Should throw exception for non-existing cafeteria")
        void deleteCafeteria_NonExisting_ThrowsException() {
            when(cafeteriaRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cafeteriaService.deleteCafeteria(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }
}
