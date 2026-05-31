package com.bitedash.organisation.service;

import com.bitedash.organisation.dto.request.VendorRequest;
import com.bitedash.organisation.dto.response.VendorResponse;
import com.bitedash.organisation.dto.response.VendorStatsResponse;
import com.bitedash.organisation.entity.Cafeteria;
import com.bitedash.organisation.entity.Vendor;
import com.bitedash.organisation.mapper.VendorMapper;
import com.bitedash.organisation.repository.CafeteriaRepository;
import com.bitedash.organisation.repository.VendorRepository;
import org.junit.jupiter.api.*;
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
 * Comprehensive tests for VendorService.
 * Tests cover: Vendor creation, retrieval by cafeteria/owner, vendor statistics.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("VendorService Tests")
class VendorServiceTest {

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private CafeteriaRepository cafeteriaRepository;

    @Mock
    private VendorMapper vendorMapper;

    @InjectMocks
    private VendorService vendorService;

    private Vendor testVendor;
    private VendorResponse testVendorResponse;
    private Cafeteria testCafeteria;

    @BeforeEach
    void setUp() {
        testCafeteria = new Cafeteria();
        testCafeteria.setId(1L);
        testCafeteria.setName("Main Cafeteria");

        testVendor = new Vendor();
        testVendor.setId(1L);
        testVendor.setName("Delicious Bites");
        testVendor.setOwnerUserId(10L);
        testVendor.setIsActive(true);

        testVendorResponse = new VendorResponse();
        testVendorResponse.setId(1L);
        testVendorResponse.setName("Delicious Bites");
    }

    @Nested
    @DisplayName("Create Vendor Tests")
    class CreateVendorTests {

        @Test
        @DisplayName("Should create vendor successfully")
        void createVendor_ValidRequest_CreatesVendor() {
            VendorRequest request = new VendorRequest(
                "New Food Stall",   // name
                null,               // contactPerson
                null,               // contactNumber
                20L                 // ownerUserId
            );

            when(vendorMapper.toEntity(request)).thenReturn(testVendor);
            when(vendorRepository.save(any(Vendor.class))).thenReturn(testVendor);
            when(vendorMapper.toResponse(testVendor)).thenReturn(testVendorResponse);

            VendorResponse response = vendorService.createVendor(request);

            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("Delicious Bites");
            verify(vendorRepository).save(any(Vendor.class));
        }
    }

    @Nested
    @DisplayName("Get Vendors By Cafeteria Tests")
    class GetVendorsByCafeteriaTests {

        @Test
        @DisplayName("Should return vendors for cafeteria")
        void getVendorsByCafeteria_ExistingCafeteria_ReturnsVendors() {
            when(cafeteriaRepository.findById(1L)).thenReturn(Optional.of(testCafeteria));
            when(vendorRepository.findByCafeteriaMappings_Cafeteria(testCafeteria))
                .thenReturn(Arrays.asList(testVendor));
            when(vendorMapper.toResponse(anyList())).thenReturn(Arrays.asList(testVendorResponse));

            List<VendorResponse> results = vendorService.getVendorsByCafeteria(1L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getName()).isEqualTo("Delicious Bites");
        }

        @Test
        @DisplayName("Should throw exception for non-existing cafeteria")
        void getVendorsByCafeteria_NonExisting_ThrowsException() {
            when(cafeteriaRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vendorService.getVendorsByCafeteria(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should return empty list when no vendors in cafeteria")
        void getVendorsByCafeteria_NoVendors_ReturnsEmptyList() {
            when(cafeteriaRepository.findById(1L)).thenReturn(Optional.of(testCafeteria));
            when(vendorRepository.findByCafeteriaMappings_Cafeteria(testCafeteria))
                .thenReturn(Arrays.asList());
            when(vendorMapper.toResponse(anyList())).thenReturn(Arrays.asList());

            List<VendorResponse> results = vendorService.getVendorsByCafeteria(1L);

            assertThat(results).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Vendor By Owner Tests")
    class GetVendorByOwnerTests {

        @Test
        @DisplayName("Should return vendor for owner user ID")
        void getVendorByOwnerUserId_ExistingOwner_ReturnsVendor() {
            when(vendorRepository.findByOwnerUserId(10L)).thenReturn(Optional.of(testVendor));
            when(vendorMapper.toResponse(testVendor)).thenReturn(testVendorResponse);

            VendorResponse response = vendorService.getVendorByOwnerUserId(10L);

            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("Delicious Bites");
        }

        @Test
        @DisplayName("Should throw exception for non-existing owner")
        void getVendorByOwnerUserId_NonExistingOwner_ThrowsException() {
            when(vendorRepository.findByOwnerUserId(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vendorService.getVendorByOwnerUserId(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Vendor not found for user ID");
        }
    }

    @Nested
    @DisplayName("Get Vendor Stats Tests")
    class GetVendorStatsTests {

        @Test
        @DisplayName("Should return stats for existing vendor")
        void getVendorStats_ExistingVendor_ReturnsStats() {
            when(vendorRepository.findById(1L)).thenReturn(Optional.of(testVendor));

            VendorStatsResponse stats = vendorService.getVendorStats(1L);

            assertThat(stats).isNotNull();
            assertThat(stats.getTotalOrders()).isEqualTo(0); // Default value
            assertThat(stats.getRating()).isEqualTo(4.5); // Default value
        }

        @Test
        @DisplayName("Should throw exception for non-existing vendor")
        void getVendorStats_NonExisting_ThrowsException() {
            when(vendorRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vendorService.getVendorStats(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Vendor not found");
        }

        @Test
        @DisplayName("Stats should include expected fields")
        void getVendorStats_HasAllFields() {
            when(vendorRepository.findById(1L)).thenReturn(Optional.of(testVendor));

            VendorStatsResponse stats = vendorService.getVendorStats(1L);

            assertThat(stats.getTotalOrders()).isNotNull();
            assertThat(stats.getActiveOrders()).isNotNull();
            assertThat(stats.getCompletedToday()).isNotNull();
            assertThat(stats.getTotalRevenue()).isNotNull();
            assertThat(stats.getAvgOrderValue()).isNotNull();
            assertThat(stats.getRating()).isNotNull();
            assertThat(stats.getTotalMenuItems()).isNotNull();
            assertThat(stats.getActiveMenuItems()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Multiple Vendors Tests")
    class MultipleVendorsTests {

        @Test
        @DisplayName("Should return multiple vendors in cafeteria")
        void getVendorsByCafeteria_MultipleVendors_ReturnsAll() {
            Vendor vendor2 = new Vendor();
            vendor2.setId(2L);
            vendor2.setName("Quick Snacks");
            vendor2.setOwnerUserId(20L);

            VendorResponse response2 = new VendorResponse();
            response2.setId(2L);
            response2.setName("Quick Snacks");

            when(cafeteriaRepository.findById(1L)).thenReturn(Optional.of(testCafeteria));
            when(vendorRepository.findByCafeteriaMappings_Cafeteria(testCafeteria))
                .thenReturn(Arrays.asList(testVendor, vendor2));
            when(vendorMapper.toResponse(anyList()))
                .thenReturn(Arrays.asList(testVendorResponse, response2));

            List<VendorResponse> results = vendorService.getVendorsByCafeteria(1L);

            assertThat(results).hasSize(2);
        }
    }
}
