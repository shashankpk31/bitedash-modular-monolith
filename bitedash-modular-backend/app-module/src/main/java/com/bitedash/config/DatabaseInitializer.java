package com.bitedash.config;

import com.bitedash.identity.entity.User;
import com.bitedash.identity.repository.UserRepository;
import com.bitedash.menu.entity.Category;
import com.bitedash.menu.entity.MenuItem;
import com.bitedash.menu.repository.CategoryRepository;
import com.bitedash.menu.repository.MenuItemRepository;
import com.bitedash.organisation.entity.*;
import com.bitedash.organisation.repository.*;
import com.bitedash.shared.enums.Role;
import com.bitedash.shared.enums.UserStatus;
import com.bitedash.wallet.entity.UserWallet;
import com.bitedash.wallet.repository.UserWalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Database Initializer - Populates H2 in-memory database with sample data
 *
 * WHY: Render free tier needs instant demo data for recruiters to test
 * RUNS: Only in 'prod' profile with H2 database on application startup
 *
 * ==================== TEST CREDENTIALS ====================
 *
 * SUPER ADMIN:
 *   Email: admin@bitedash.com
 *   Password: Admin@123
 *
 * ORG ADMIN (TechCorp):
 *   Email: orgadmin@techcorp.com
 *   Password: OrgAdmin@123
 *
 * VENDOR (Pizza Corner):
 *   Email: vendor@pizzacorner.com
 *   Password: Vendor@123
 *
 * EMPLOYEE (John Doe):
 *   Email: john.doe@techcorp.com
 *   Password: Employee@123
 *   Wallet Balance: ₹500
 *
 * EMPLOYEE (Jane Smith):
 *   Email: jane.smith@techcorp.com
 *   Password: Employee@123
 *   Wallet Balance: ₹300
 *
 * ========================================================
 */
@Component
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final LocationRepository locationRepository;
    private final OfficeRepository officeRepository;
    private final CafeteriaRepository cafeteriaRepository;
    private final VendorRepository vendorRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserWalletRepository userWalletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("========================================");
        log.info("🚀 Initializing Database with Sample Data");
        log.info("========================================");

        try {
            // 1. Create Super Admin
            User superAdmin = createSuperAdmin();
            log.info("✅ Super Admin created: {}", superAdmin.getEmail());

            // 2. Create Organization (TechCorp Inc.)
            Organization techCorp = createOrganization();
            log.info("✅ Organization created: {}", techCorp.getName());

            // 3. Create Org Admin for TechCorp
            User orgAdmin = createOrgAdmin(techCorp);
            log.info("✅ Org Admin created: {}", orgAdmin.getEmail());

            // 4. Create Location → Office → Cafeteria hierarchy
            Location location = createLocation(techCorp);
            Office office = createOffice(location);
            Cafeteria cafeteria = createCafeteria(office);
            log.info("✅ Location hierarchy created: {} → {} → {}",
                     location.getCityName(), office.getOfficeName(), cafeteria.getCafeteriaName());

            // 5. Create Vendors
            List<Vendor> vendors = createVendors(cafeteria);
            log.info("✅ {} Vendors created", vendors.size());

            // 6. Create Menu Categories and Items
            createMenuItems(vendors);
            log.info("✅ Menu items created for all vendors");

            // 7. Create Employees with Wallets
            List<User> employees = createEmployees(techCorp, office);
            createWallets(employees);
            log.info("✅ {} Employees created with wallets", employees.size());

            log.info("========================================");
            log.info("✨ Database initialization complete!");
            log.info("========================================");
            log.info("📋 TEST CREDENTIALS:");
            log.info("   Super Admin: admin@bitedash.com / Admin@123");
            log.info("   Org Admin:   orgadmin@techcorp.com / OrgAdmin@123");
            log.info("   Vendor:      vendor@pizzacorner.com / Vendor@123");
            log.info("   Employee:    john.doe@techcorp.com / Employee@123");
            log.info("========================================");

        } catch (Exception e) {
            log.error("❌ Failed to initialize database", e);
            throw new RuntimeException("Database initialization failed", e);
        }
    }

    private User createSuperAdmin() {
        User admin = new User();
        admin.setFullName("Super Admin");
        admin.setEmail("admin@bitedash.com");
        admin.setPhoneNumber("9876543210");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ROLE_SUPER_ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setEmailVerified(true);
        admin.setPhoneVerified(true);
        admin.setProfileComplete(true);
        return userRepository.save(admin);
    }

    private Organization createOrganization() {
        Organization org = new Organization();
        org.setName("TechCorp Inc.");
        org.setRegisteredAddress("123 Tech Park, Bangalore, Karnataka 560001");
        org.setGstin("29ABCDE1234F1Z5");
        org.setContactEmail("contact@techcorp.com");
        org.setContactPhone("08012345678");
        org.setActive(true);
        return organizationRepository.save(org);
    }

    private User createOrgAdmin(Organization org) {
        User orgAdmin = new User();
        orgAdmin.setFullName("Org Admin");
        orgAdmin.setEmail("orgadmin@techcorp.com");
        orgAdmin.setPhoneNumber("9876543211");
        orgAdmin.setPassword(passwordEncoder.encode("OrgAdmin@123"));
        orgAdmin.setRole(Role.ROLE_ORG_ADMIN);
        orgAdmin.setOrganizationId(org.getId());
        orgAdmin.setStatus(UserStatus.ACTIVE);
        orgAdmin.setEmailVerified(true);
        orgAdmin.setPhoneVerified(true);
        orgAdmin.setProfileComplete(true);
        return userRepository.save(orgAdmin);
    }

    private Location createLocation(Organization org) {
        Location location = new Location();
        location.setOrganization(org);
        location.setCityName("Bangalore");
        location.setState("Karnataka");
        location.setCountry("India");
        location.setActive(true);
        return locationRepository.save(location);
    }

    private Office createOffice(Location location) {
        Office office = new Office();
        office.setLocation(location);
        office.setOfficeName("Tech Park HQ");
        office.setAddress("Tower A, 5th Floor, Tech Park, Whitefield");
        office.setCity("Bangalore");
        office.setState("Karnataka");
        office.setPincode("560066");
        return officeRepository.save(office);
    }

    private Cafeteria createCafeteria(Office office) {
        Cafeteria cafeteria = new Cafeteria();
        cafeteria.setOffice(office);
        cafeteria.setCafeteriaName("Tech Park Food Court");
        cafeteria.setFloorNumber(1);
        cafeteria.setCapacity(200);
        cafeteria.setActive(true);
        return cafeteriaRepository.save(cafeteria);
    }

    private List<Vendor> createVendors(Cafeteria cafeteria) {
        List<Vendor> vendors = new ArrayList<>();

        // Vendor 1: Pizza Corner
        User vendorUser1 = new User();
        vendorUser1.setFullName("Pizza Corner Owner");
        vendorUser1.setEmail("vendor@pizzacorner.com");
        vendorUser1.setPhoneNumber("9876543212");
        vendorUser1.setPassword(passwordEncoder.encode("Vendor@123"));
        vendorUser1.setRole(Role.ROLE_VENDOR);
        vendorUser1.setShopName("Pizza Corner");
        vendorUser1.setGstNumber("29PIZZA1234F1Z5");
        vendorUser1.setStatus(UserStatus.ACTIVE);
        vendorUser1.setEmailVerified(true);
        vendorUser1.setPhoneVerified(true);
        vendorUser1.setProfileComplete(true);
        vendorUser1 = userRepository.save(vendorUser1);

        Vendor vendor1 = new Vendor();
        vendor1.setOwnerUserId(vendorUser1.getId());
        vendor1.setVendorName("Pizza Corner");
        vendor1.setContactEmail("vendor@pizzacorner.com");
        vendor1.setContactPhone("9876543212");
        vendor1.setLicenseNumber("LIC-PIZZA-2024");
        vendor1.setActive(true);
        vendor1 = vendorRepository.save(vendor1);
        vendors.add(vendor1);

        // Map vendor to cafeteria
        VendorCafeteriaMapping mapping1 = new VendorCafeteriaMapping();
        mapping1.setVendor(vendor1);
        mapping1.setCafeteria(cafeteria);
        mapping1.setStallNumber("S01");
        mapping1.setActive(true);
        vendor1.getCafeteriaMappings().add(mapping1);

        // Vendor 2: South Indian Kitchen
        User vendorUser2 = new User();
        vendorUser2.setFullName("South Kitchen Owner");
        vendorUser2.setEmail("vendor@southkitchen.com");
        vendorUser2.setPhoneNumber("9876543213");
        vendorUser2.setPassword(passwordEncoder.encode("Vendor@123"));
        vendorUser2.setRole(Role.ROLE_VENDOR);
        vendorUser2.setShopName("South Indian Kitchen");
        vendorUser2.setGstNumber("29SOUTH1234F1Z5");
        vendorUser2.setStatus(UserStatus.ACTIVE);
        vendorUser2.setEmailVerified(true);
        vendorUser2.setPhoneVerified(true);
        vendorUser2.setProfileComplete(true);
        vendorUser2 = userRepository.save(vendorUser2);

        Vendor vendor2 = new Vendor();
        vendor2.setOwnerUserId(vendorUser2.getId());
        vendor2.setVendorName("South Indian Kitchen");
        vendor2.setContactEmail("vendor@southkitchen.com");
        vendor2.setContactPhone("9876543213");
        vendor2.setLicenseNumber("LIC-SOUTH-2024");
        vendor2.setActive(true);
        vendor2 = vendorRepository.save(vendor2);
        vendors.add(vendor2);

        VendorCafeteriaMapping mapping2 = new VendorCafeteriaMapping();
        mapping2.setVendor(vendor2);
        mapping2.setCafeteria(cafeteria);
        mapping2.setStallNumber("S02");
        mapping2.setActive(true);
        vendor2.getCafeteriaMappings().add(mapping2);

        return vendors;
    }

    private void createMenuItems(List<Vendor> vendors) {
        // Pizza Corner Menu
        Vendor pizzaVendor = vendors.get(0);
        Category pizzaCategory = createCategory("Pizza", pizzaVendor);
        createMenuItem("Margherita Pizza", "Classic cheese pizza", 199.00, pizzaCategory, pizzaVendor);
        createMenuItem("Pepperoni Pizza", "Spicy pepperoni with cheese", 249.00, pizzaCategory, pizzaVendor);
        createMenuItem("Veggie Supreme", "Loaded with vegetables", 229.00, pizzaCategory, pizzaVendor);

        Category beverageCategory = createCategory("Beverages", pizzaVendor);
        createMenuItem("Coke", "Chilled Coca-Cola", 40.00, beverageCategory, pizzaVendor);
        createMenuItem("Fresh Lime Soda", "Refreshing lime drink", 50.00, beverageCategory, pizzaVendor);

        // South Indian Kitchen Menu
        Vendor southVendor = vendors.get(1);
        Category breakfastCategory = createCategory("Breakfast", southVendor);
        createMenuItem("Masala Dosa", "Crispy dosa with potato filling", 80.00, breakfastCategory, southVendor);
        createMenuItem("Idli Sambar", "3 soft idlis with sambar", 60.00, breakfastCategory, southVendor);
        createMenuItem("Vada Sambar", "2 crispy vadas with sambar", 70.00, breakfastCategory, southVendor);

        Category mealCategory = createCategory("Meals", southVendor);
        createMenuItem("South Indian Thali", "Complete meal with rice, dal, curry", 150.00, mealCategory, southVendor);
        createMenuItem("Curd Rice", "Comfort food with curd", 90.00, mealCategory, southVendor);

        Category beverageCategory2 = createCategory("Beverages", southVendor);
        createMenuItem("Filter Coffee", "Authentic South Indian coffee", 30.00, beverageCategory2, southVendor);
        createMenuItem("Buttermilk", "Fresh and spiced", 25.00, beverageCategory2, southVendor);
    }

    private Category createCategory(String name, Vendor vendor) {
        Category category = new Category();
        category.setCategoryName(name);
        category.setVendorId(vendor.getId());
        return categoryRepository.save(category);
    }

    private MenuItem createMenuItem(String name, String description, double price, Category category, Vendor vendor) {
        MenuItem item = new MenuItem();
        item.setItemName(name);
        item.setDescription(description);
        item.setPrice(BigDecimal.valueOf(price));
        item.setCategory(category);
        item.setVendorId(vendor.getId());
        item.setIsAvailable(true);
        item.setIsVeg(true); // Default to veg for demo
        return menuItemRepository.save(item);
    }

    private List<User> createEmployees(Organization org, Office office) {
        List<User> employees = new ArrayList<>();

        // Employee 1: John Doe
        User john = new User();
        john.setFullName("John Doe");
        john.setEmail("john.doe@techcorp.com");
        john.setPhoneNumber("9876543214");
        john.setPassword(passwordEncoder.encode("Employee@123"));
        john.setRole(Role.ROLE_EMPLOYEE);
        john.setEmployeeId("EMP001");
        john.setOrganizationId(org.getId());
        john.setOfficeId(office.getId());
        john.setStatus(UserStatus.ACTIVE);
        john.setEmailVerified(true);
        john.setPhoneVerified(true);
        john.setProfileComplete(true);
        employees.add(userRepository.save(john));

        // Employee 2: Jane Smith
        User jane = new User();
        jane.setFullName("Jane Smith");
        jane.setEmail("jane.smith@techcorp.com");
        jane.setPhoneNumber("9876543215");
        jane.setPassword(passwordEncoder.encode("Employee@123"));
        jane.setRole(Role.ROLE_EMPLOYEE);
        jane.setEmployeeId("EMP002");
        jane.setOrganizationId(org.getId());
        jane.setOfficeId(office.getId());
        jane.setStatus(UserStatus.ACTIVE);
        jane.setEmailVerified(true);
        jane.setPhoneVerified(true);
        jane.setProfileComplete(true);
        employees.add(userRepository.save(jane));

        // Employee 3: Mike Johnson
        User mike = new User();
        mike.setFullName("Mike Johnson");
        mike.setEmail("mike.johnson@techcorp.com");
        mike.setPhoneNumber("9876543216");
        mike.setPassword(passwordEncoder.encode("Employee@123"));
        mike.setRole(Role.ROLE_EMPLOYEE);
        mike.setEmployeeId("EMP003");
        mike.setOrganizationId(org.getId());
        mike.setOfficeId(office.getId());
        mike.setStatus(UserStatus.ACTIVE);
        mike.setEmailVerified(true);
        mike.setPhoneVerified(true);
        mike.setProfileComplete(true);
        employees.add(userRepository.save(mike));

        return employees;
    }

    private void createWallets(List<User> employees) {
        // John Doe - ₹500
        UserWallet johnWallet = new UserWallet();
        johnWallet.setUserId(employees.get(0).getId());
        johnWallet.setBalance(BigDecimal.valueOf(500.00));
        johnWallet.setActive(true);
        userWalletRepository.save(johnWallet);

        // Jane Smith - ₹300
        UserWallet janeWallet = new UserWallet();
        janeWallet.setUserId(employees.get(1).getId());
        janeWallet.setBalance(BigDecimal.valueOf(300.00));
        janeWallet.setActive(true);
        userWalletRepository.save(janeWallet);

        // Mike Johnson - ₹750
        UserWallet mikeWallet = new UserWallet();
        mikeWallet.setUserId(employees.get(2).getId());
        mikeWallet.setBalance(BigDecimal.valueOf(750.00));
        mikeWallet.setActive(true);
        userWalletRepository.save(mikeWallet);
    }
}
