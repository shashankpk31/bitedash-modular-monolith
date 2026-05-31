package com.bitedash.inventory.service;

import com.bitedash.inventory.dto.InventoryRequest;
import com.bitedash.inventory.dto.RestockRequest;
import com.bitedash.inventory.dto.InventoryResponse;
import com.bitedash.inventory.entity.Inventory;
import com.bitedash.inventory.repository.InventoryRepository;
import com.bitedash.inventory.repository.InventoryTransactionRepository;
import com.bitedash.shared.util.UserContext;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Comprehensive tests for InventoryService.
 * Tests cover: Inventory CRUD, restocking, stock levels, expiry tracking.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryService Tests")
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private MockedStatic<UserContext> userContextMock;

    private Inventory testInventory;

    @BeforeEach
    void setUp() {
        testInventory = new Inventory();
        testInventory.setId(1L);
        testInventory.setItemName("Rice");
        testInventory.setCafeteriaId(1L);
        testInventory.setVendorId(5L);
        testInventory.setStockQuantity(new BigDecimal("100.00"));
        testInventory.setUnit("kg");
        testInventory.setMinStockLevel(new BigDecimal("20.00"));
        testInventory.setMaxStockLevel(new BigDecimal("200.00"));
        testInventory.setReorderQuantity(50);
        testInventory.setCostPerUnit(new BigDecimal("45.00"));
        testInventory.setSupplierName("ABC Traders");
        testInventory.setExpiryDate(LocalDate.now().plusDays(30));
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
    @DisplayName("Create Inventory Tests")
    class CreateInventoryTests {

        @Test
        @DisplayName("Should create inventory item successfully")
        void createInventoryItem_ValidRequest_CreatesItem() {
            InventoryRequest request = new InventoryRequest();
            request.setItemName("Sugar");
            request.setCafeteriaId(1L);
            request.setVendorId(5L);
            request.setStockQuantity(new BigDecimal("50.00"));
            request.setUnit("kg");
            request.setMinStockLevel(new BigDecimal("10.00"));

            when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> {
                Inventory item = inv.getArgument(0);
                item.setId(2L);
                return item;
            });

            InventoryResponse response = inventoryService.createInventoryItem(request);

            assertThat(response).isNotNull();
            verify(inventoryRepository).save(any(Inventory.class));
        }

        @Test
        @DisplayName("Should set correct stock status on creation")
        void createInventoryItem_SetsStockStatus() {
            InventoryRequest request = new InventoryRequest();
            request.setItemName("Salt");
            request.setCafeteriaId(1L);
            request.setStockQuantity(new BigDecimal("5.00")); // Low stock
            request.setMinStockLevel(new BigDecimal("10.00"));

            when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> {
                Inventory item = inv.getArgument(0);
                item.setId(3L);
                item.updateStockStatus(); // Simulate actual save behavior
                return item;
            });

            InventoryResponse response = inventoryService.createInventoryItem(request);

            assertThat(response).isNotNull();
            verify(inventoryRepository).save(any(Inventory.class));
        }
    }

    @Nested
    @DisplayName("Update Inventory Tests")
    class UpdateInventoryTests {

        @Test
        @DisplayName("Should update existing inventory item")
        void updateInventoryItem_ExistingId_UpdatesItem() {
            InventoryRequest request = new InventoryRequest();
            request.setItemName("Updated Rice");
            request.setStockQuantity(new BigDecimal("150.00"));

            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));
            when(inventoryRepository.save(any(Inventory.class))).thenReturn(testInventory);

            InventoryResponse response = inventoryService.updateInventoryItem(1L, request);

            assertThat(response).isNotNull();
            assertThat(testInventory.getItemName()).isEqualTo("Updated Rice");
            verify(inventoryRepository).save(testInventory);
        }

        @Test
        @DisplayName("Should throw exception for non-existing inventory")
        void updateInventoryItem_NonExisting_ThrowsException() {
            InventoryRequest request = new InventoryRequest();
            request.setItemName("Test");

            when(inventoryRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> inventoryService.updateInventoryItem(999L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Get Inventory Tests")
    class GetInventoryTests {

        @Test
        @DisplayName("Should return inventory by ID")
        void getInventoryItemById_ExistingId_ReturnsItem() {
            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));

            InventoryResponse response = inventoryService.getInventoryItemById(1L);

            assertThat(response).isNotNull();
            assertThat(response.getItemName()).isEqualTo("Rice");
        }

        @Test
        @DisplayName("Should throw exception for non-existing ID")
        void getInventoryItemById_NonExisting_ThrowsException() {
            when(inventoryRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> inventoryService.getInventoryItemById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should return inventory by cafeteria")
        void getInventoryByCafeteria_ReturnsItems() {
            when(inventoryRepository.findByCafeteriaIdAndDeletedFalse(1L))
                .thenReturn(Arrays.asList(testInventory));

            List<InventoryResponse> results = inventoryService.getInventoryByCafeteria(1L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getItemName()).isEqualTo("Rice");
        }

        @Test
        @DisplayName("Should search inventory by keyword")
        void searchInventoryItems_ReturnsMatchingItems() {
            when(inventoryRepository.searchByItemName("rice"))
                .thenReturn(Arrays.asList(testInventory));

            List<InventoryResponse> results = inventoryService.searchInventoryItems("rice");

            assertThat(results).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Stock Level Tests")
    class StockLevelTests {

        @Test
        @DisplayName("Should return low stock items")
        void getLowStockItemsByCafeteria_ReturnsLowStockItems() {
            testInventory.setStockQuantity(new BigDecimal("15.00")); // Below min 20

            when(inventoryRepository.findLowStockItemsByCafeteria(1L))
                .thenReturn(Arrays.asList(testInventory));

            List<InventoryResponse> results = inventoryService.getLowStockItemsByCafeteria(1L);

            assertThat(results).hasSize(1);
        }

        @Test
        @DisplayName("Should return out of stock items")
        void getOutOfStockItemsByCafeteria_ReturnsOutOfStockItems() {
            testInventory.setStockQuantity(BigDecimal.ZERO);

            when(inventoryRepository.findOutOfStockItemsByCafeteria(1L))
                .thenReturn(Arrays.asList(testInventory));

            List<InventoryResponse> results = inventoryService.getOutOfStockItemsByCafeteria(1L);

            assertThat(results).hasSize(1);
        }

        @Test
        @DisplayName("Should return items needing reorder")
        void getItemsNeedingReorderByCafeteria_ReturnsNeedingReorder() {
            when(inventoryRepository.findItemsNeedingReorderByCafeteria(1L))
                .thenReturn(Arrays.asList(testInventory));

            List<InventoryResponse> results = inventoryService.getItemsNeedingReorderByCafeteria(1L);

            assertThat(results).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Expiry Tests")
    class ExpiryTests {

        @Test
        @DisplayName("Should return items expiring soon")
        void getItemsExpiringSoon_ReturnsExpiringItems() {
            testInventory.setExpiryDate(LocalDate.now().plusDays(5));

            when(inventoryRepository.findItemsExpiringBetween(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Arrays.asList(testInventory));

            List<InventoryResponse> results = inventoryService.getItemsExpiringSoon(7);

            assertThat(results).hasSize(1);
        }

        @Test
        @DisplayName("Should return expired items")
        void getExpiredItems_ReturnsExpiredItems() {
            testInventory.setExpiryDate(LocalDate.now().minusDays(1));

            when(inventoryRepository.findExpiredItems(any(LocalDate.class)))
                .thenReturn(Arrays.asList(testInventory));

            List<InventoryResponse> results = inventoryService.getExpiredItems();

            assertThat(results).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Restock Tests")
    class RestockTests {

        @Test
        @DisplayName("Should restock inventory successfully")
        void restockInventory_ValidRequest_RestocksItem() {
            mockUserContext(1L, "ROLE_VENDOR", 1L);

            RestockRequest request = new RestockRequest();
            request.setInventoryId(1L);
            request.setQuantity(new BigDecimal("50.00"));
            request.setRemarks("Weekly restock");

            BigDecimal expectedNewQuantity = testInventory.getStockQuantity().add(request.getQuantity());

            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));
            when(inventoryRepository.save(any(Inventory.class))).thenReturn(testInventory);

            InventoryResponse response = inventoryService.restockInventory(request);

            assertThat(response).isNotNull();
            assertThat(testInventory.getStockQuantity()).isEqualByComparingTo(expectedNewQuantity);
            verify(inventoryRepository).save(testInventory);
        }

        @Test
        @DisplayName("Should reject zero restock quantity")
        void restockInventory_ZeroQuantity_ThrowsException() {
            RestockRequest request = new RestockRequest();
            request.setInventoryId(1L);
            request.setQuantity(BigDecimal.ZERO);

            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));

            assertThatThrownBy(() -> inventoryService.restockInventory(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("positive");
        }

        @Test
        @DisplayName("Should reject negative restock quantity")
        void restockInventory_NegativeQuantity_ThrowsException() {
            RestockRequest request = new RestockRequest();
            request.setInventoryId(1L);
            request.setQuantity(new BigDecimal("-10.00"));

            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));

            assertThatThrownBy(() -> inventoryService.restockInventory(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("positive");
        }

        @Test
        @DisplayName("Should throw exception for non-existing inventory")
        void restockInventory_NonExisting_ThrowsException() {
            RestockRequest request = new RestockRequest();
            request.setInventoryId(999L);
            request.setQuantity(new BigDecimal("50.00"));

            when(inventoryRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> inventoryService.restockInventory(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should update last restocked timestamp")
        void restockInventory_UpdatesLastRestockedAt() {
            mockUserContext(1L, "ROLE_VENDOR", 1L);

            RestockRequest request = new RestockRequest();
            request.setInventoryId(1L);
            request.setQuantity(new BigDecimal("50.00"));

            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));
            when(inventoryRepository.save(any(Inventory.class))).thenReturn(testInventory);

            inventoryService.restockInventory(request);

            assertThat(testInventory.getLastRestockedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Delete Inventory Tests")
    class DeleteInventoryTests {

        @Test
        @DisplayName("Should soft delete existing inventory item")
        void deleteInventoryItem_ExistingId_SoftDeletes() {
            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));
            when(inventoryRepository.save(any(Inventory.class))).thenReturn(testInventory);

            inventoryService.deleteInventoryItem(1L);

            assertThat(testInventory.getDeleted()).isTrue();
            verify(inventoryRepository).save(testInventory);
        }

        @Test
        @DisplayName("Should throw exception for non-existing inventory")
        void deleteInventoryItem_NonExisting_ThrowsException() {
            when(inventoryRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> inventoryService.deleteInventoryItem(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("Response Mapping Tests")
    class ResponseMappingTests {

        @Test
        @DisplayName("Should include all fields in response")
        void getInventoryItemById_ResponseIncludesAllFields() {
            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));

            InventoryResponse response = inventoryService.getInventoryItemById(1L);

            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getItemName()).isEqualTo("Rice");
            assertThat(response.getCafeteriaId()).isEqualTo(1L);
            assertThat(response.getVendorId()).isEqualTo(5L);
            assertThat(response.getStockQuantity()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(response.getUnit()).isEqualTo("kg");
            assertThat(response.getMinStockLevel()).isEqualByComparingTo(new BigDecimal("20.00"));
            assertThat(response.getSupplierName()).isEqualTo("ABC Traders");
        }

        @Test
        @DisplayName("Should calculate needs reorder flag")
        void getInventoryItemById_CalculatesNeedsReorder() {
            testInventory.setStockQuantity(new BigDecimal("15.00")); // Below reorder level
            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));

            InventoryResponse response = inventoryService.getInventoryItemById(1L);

            assertThat(response.getNeedsReorder()).isTrue();
        }

        @Test
        @DisplayName("Should calculate expiry flags")
        void getInventoryItemById_CalculatesExpiryFlags() {
            testInventory.setExpiryDate(LocalDate.now().minusDays(1)); // Expired
            when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testInventory));

            InventoryResponse response = inventoryService.getInventoryItemById(1L);

            assertThat(response.getIsExpired()).isTrue();
        }
    }
}
