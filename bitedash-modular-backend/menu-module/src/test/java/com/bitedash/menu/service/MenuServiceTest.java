package com.bitedash.menu.service;

import com.bitedash.menu.dto.request.CategoryRequest;
import com.bitedash.menu.dto.request.MenuItemRequest;
import com.bitedash.menu.dto.response.CategoryResponse;
import com.bitedash.menu.dto.response.MenuItemResponse;
import com.bitedash.menu.entity.Category;
import com.bitedash.menu.entity.MenuItem;
import com.bitedash.menu.repository.CategoryRepository;
import com.bitedash.menu.repository.MenuItemRepository;
import com.bitedash.shared.api.organisation.OrganisationService;
import com.bitedash.shared.util.UserContext;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Comprehensive tests for MenuService.
 * Tests cover: Menu items CRUD, Categories CRUD, Vendor ownership validation.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MenuService Tests")
class MenuServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private OrganisationService organisationService;

    @InjectMocks
    private MenuService menuService;

    private MockedStatic<UserContext> userContextMock;

    private MenuItem testMenuItem;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Main Course");
        testCategory.setVendorId(10L);

        testMenuItem = new MenuItem();
        testMenuItem.setId(1L);
        testMenuItem.setName("Butter Chicken");
        testMenuItem.setDescription("Creamy chicken curry");
        testMenuItem.setPrice(new BigDecimal("350.00"));
        testMenuItem.setVendorId(10L);
        testMenuItem.setCategory(testCategory);
        testMenuItem.setIsAvailable(true);
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
    @DisplayName("Get Menu Items Tests")
    class GetMenuItemsTests {

        @Test
        @DisplayName("Should return menu items by vendor")
        void getMenuItemsByVendor_ReturnsItems() {
            when(menuItemRepository.findByVendorIdAndDeletedFalseOrderByDisplayOrderAsc(10L))
                .thenReturn(Arrays.asList(testMenuItem));

            List<MenuItemResponse> items = menuService.getMenuItemsByVendor(10L);

            assertThat(items).hasSize(1);
            assertThat(items.get(0).getName()).isEqualTo("Butter Chicken");
        }

        @Test
        @DisplayName("Should return menu item by ID")
        void getMenuItemById_ExistingId_ReturnsItem() {
            when(menuItemRepository.findWithCategoryById(1L)).thenReturn(Optional.of(testMenuItem));

            MenuItemResponse item = menuService.getMenuItemById(1L);

            assertThat(item).isNotNull();
            assertThat(item.getName()).isEqualTo("Butter Chicken");
        }

        @Test
        @DisplayName("Should throw exception for non-existing menu item")
        void getMenuItemById_NonExisting_ThrowsException() {
            when(menuItemRepository.findWithCategoryById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> menuService.getMenuItemById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Should return active promoted items")
        void getActivePromotedItems_ReturnsPromotedItems() {
            testMenuItem.setIsPromoted(true);
            when(menuItemRepository.findActivePromotedItems(any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(testMenuItem));

            List<MenuItemResponse> items = menuService.getActivePromotedItems();

            assertThat(items).hasSize(1);
        }

        @Test
        @DisplayName("Should return popular items")
        void getPopularItems_ReturnsPopularItems() {
            testMenuItem.setPopularityScore(100);
            when(menuItemRepository.findByIsAvailableTrueAndDeletedFalseOrderByPopularityScoreDesc())
                .thenReturn(Arrays.asList(testMenuItem));

            List<MenuItemResponse> items = menuService.getPopularItems();

            assertThat(items).hasSize(1);
        }

        @Test
        @DisplayName("Should search menu items by keyword")
        void searchMenuItems_ReturnsMatchingItems() {
            when(menuItemRepository.searchByName("chicken")).thenReturn(Arrays.asList(testMenuItem));

            List<MenuItemResponse> items = menuService.searchMenuItems("chicken");

            assertThat(items).hasSize(1);
            assertThat(items.get(0).getName()).contains("Chicken");
        }
    }

    @Nested
    @DisplayName("Create Menu Item Tests")
    class CreateMenuItemTests {

        @Test
        @DisplayName("Should create menu item successfully")
        void createMenuItem_ValidRequest_CreatesItem() {
            MenuItemRequest request = new MenuItemRequest();
            request.setName("Paneer Tikka");
            request.setPrice(new BigDecimal("280.00"));
            request.setVendorId(10L);
            request.setCategoryId(1L);

            when(categoryRepository.existsById(1L)).thenReturn(true);
            when(categoryRepository.getReferenceById(1L)).thenReturn(testCategory);
            when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(inv -> {
                MenuItem item = inv.getArgument(0);
                item.setId(2L);
                return item;
            });

            MenuItemResponse response = menuService.createMenuItem(request);

            assertThat(response).isNotNull();
            verify(menuItemRepository).save(any(MenuItem.class));
        }

        @Test
        @DisplayName("Should throw exception for non-existing category")
        void createMenuItem_InvalidCategory_ThrowsException() {
            MenuItemRequest request = new MenuItemRequest();
            request.setName("Test Item");
            request.setCategoryId(999L);

            when(categoryRepository.existsById(999L)).thenReturn(false);

            assertThatThrownBy(() -> menuService.createMenuItem(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Category not found");
        }
    }

    @Nested
    @DisplayName("Update Menu Item Tests")
    class UpdateMenuItemTests {

        @Test
        @DisplayName("Should update menu item by owner vendor")
        void updateMenuItem_OwnerVendor_UpdatesItem() {
            mockUserContext(10L, "ROLE_VENDOR", 1L);

            MenuItemRequest request = new MenuItemRequest();
            request.setName("Updated Butter Chicken");
            request.setPrice(new BigDecimal("400.00"));

            when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
            when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

            MenuItemResponse response = menuService.updateMenuItem(1L, request);

            assertThat(response).isNotNull();
            verify(menuItemRepository).save(any(MenuItem.class));
        }

        @Test
        @DisplayName("Should update menu item by admin")
        void updateMenuItem_Admin_UpdatesItem() {
            mockUserContext(999L, "ROLE_SUPER_ADMIN", null);

            MenuItemRequest request = new MenuItemRequest();
            request.setName("Admin Updated Item");

            when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
            when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

            MenuItemResponse response = menuService.updateMenuItem(1L, request);

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should reject update by non-owner vendor")
        void updateMenuItem_NonOwnerVendor_ThrowsException() {
            mockUserContext(20L, "ROLE_VENDOR", 1L); // Different vendor ID

            MenuItemRequest request = new MenuItemRequest();
            request.setName("Unauthorized Update");

            when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));

            assertThatThrownBy(() -> menuService.updateMenuItem(1L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("permission");
        }
    }

    @Nested
    @DisplayName("Delete Menu Item Tests")
    class DeleteMenuItemTests {

        @Test
        @DisplayName("Should soft delete menu item by owner")
        void deleteMenuItem_OwnerVendor_DeletesItem() {
            mockUserContext(10L, "ROLE_VENDOR", 1L);

            when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
            when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

            menuService.deleteMenuItem(1L);

            assertThat(testMenuItem.getDeleted()).isTrue();
            verify(menuItemRepository).save(testMenuItem);
        }

        @Test
        @DisplayName("Should reject delete by non-owner")
        void deleteMenuItem_NonOwner_ThrowsException() {
            mockUserContext(20L, "ROLE_VENDOR", 1L);

            when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));

            assertThatThrownBy(() -> menuService.deleteMenuItem(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("permission");
        }
    }

    @Nested
    @DisplayName("Category Tests")
    class CategoryTests {

        @Test
        @DisplayName("Should return categories by vendor")
        void getCategoriesByVendor_ReturnsCategories() {
            when(categoryRepository.findByVendorIdOrderByDisplayOrderAsc(10L))
                .thenReturn(Arrays.asList(testCategory));

            List<CategoryResponse> categories = menuService.getCategoriesByVendor(10L, false);

            assertThat(categories).hasSize(1);
            assertThat(categories.get(0).getName()).isEqualTo("Main Course");
        }

        @Test
        @DisplayName("Should create category")
        void createCategory_ValidRequest_CreatesCategory() {
            CategoryRequest request = new CategoryRequest();
            request.setName("Desserts");
            request.setVendorId(10L);

            when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
                Category cat = inv.getArgument(0);
                cat.setId(2L);
                return cat;
            });

            CategoryResponse response = menuService.createCategory(request);

            assertThat(response).isNotNull();
            verify(categoryRepository).save(any(Category.class));
        }

        @Test
        @DisplayName("Should update category by owner")
        void updateCategory_OwnerVendor_UpdatesCategory() {
            mockUserContext(10L, "ROLE_VENDOR", 1L);

            CategoryRequest request = new CategoryRequest();
            request.setName("Updated Category");

            when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
            when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

            CategoryResponse response = menuService.updateCategory(1L, request);

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should soft delete category by owner")
        void deleteCategory_OwnerVendor_DeletesCategory() {
            mockUserContext(10L, "ROLE_VENDOR", 1L);

            when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
            when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

            menuService.deleteCategory(1L);

            assertThat(testCategory.getDeleted()).isTrue();
        }
    }

    @Nested
    @DisplayName("Cross-Module API Tests")
    class CrossModuleTests {

        @Test
        @DisplayName("Should return menu items by cafeteria")
        void getMenuItemsByCafeteria_ReturnsItems() {
            when(organisationService.getActiveVendorIdsByCafeteria(1L))
                .thenReturn(Arrays.asList(10L, 20L));
            when(menuItemRepository.findByVendorIdInAndDeletedFalseOrderByVendorIdAscDisplayOrderAsc(anyList()))
                .thenReturn(Arrays.asList(testMenuItem));

            List<MenuItemResponse> items = menuService.getMenuItemsByCafeteria(1L);

            assertThat(items).hasSize(1);
        }

        @Test
        @DisplayName("Should return empty when no vendors in cafeteria")
        void getMenuItemsByCafeteria_NoVendors_ReturnsEmpty() {
            when(organisationService.getActiveVendorIdsByCafeteria(1L))
                .thenReturn(Arrays.asList());

            List<MenuItemResponse> items = menuService.getMenuItemsByCafeteria(1L);

            assertThat(items).isEmpty();
        }

        @Test
        @DisplayName("Should check menu item existence")
        void menuItemExists_ExistingId_ReturnsTrue() {
            when(menuItemRepository.existsById(1L)).thenReturn(true);

            boolean exists = menuService.menuItemExists(1L);

            assertThat(exists).isTrue();
        }
    }
}
