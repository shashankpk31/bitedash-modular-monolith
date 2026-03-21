-- =====================================================
-- BiteDash Modular Monolith - Sample Data Insertion
-- Version: 1.0
-- Date: 2026-03-21
-- =====================================================
-- This script inserts sample data for development/testing
-- Run after V1__init_all_tables.sql
-- =====================================================

-- =====================================================
-- IDENTITY SCHEMA - Sample Users
-- =====================================================

-- Super Admin User
INSERT INTO identity_schema.users (username, full_name, email, password, role, email_verified, phone_verified, status, profile_complete, created_at, created_by, deleted)
VALUES
('superadmin', 'Super Admin', 'admin@bitedash.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_SUPER_ADMIN', true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'system', false)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- ORGANISATION SCHEMA - Sample Organizations
-- =====================================================

-- Insert Sample Organizations
INSERT INTO organisation_schema.organizations (name, domain, created_at, created_by, deleted)
VALUES
('TechCorp Inc.', 'techcorp.com', CURRENT_TIMESTAMP, 'superadmin', false),
('InnovateTech Solutions', 'innovatetech.com', CURRENT_TIMESTAMP, 'superadmin', false),
('Digital Dynamics', 'digitaldynamics.com', CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- Get organization IDs (for reference)
-- TechCorp Inc. = 1, InnovateTech Solutions = 2, Digital Dynamics = 3

-- =====================================================
-- Insert Locations for TechCorp Inc.
-- =====================================================

INSERT INTO organisation_schema.locations (org_id, city_name, state, country, created_at, created_by, deleted)
VALUES
(1, 'Bangalore', 'Karnataka', 'India', CURRENT_TIMESTAMP, 'superadmin', false),
(1, 'Mumbai', 'Maharashtra', 'India', CURRENT_TIMESTAMP, 'superadmin', false),
(1, 'Hyderabad', 'Telangana', 'India', CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- Insert Locations for InnovateTech Solutions
INSERT INTO organisation_schema.locations (org_id, city_name, state, country, created_at, created_by, deleted)
VALUES
(2, 'Pune', 'Maharashtra', 'India', CURRENT_TIMESTAMP, 'superadmin', false),
(2, 'Chennai', 'Tamil Nadu', 'India', CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Insert Offices for TechCorp Locations
-- =====================================================

-- Bangalore Offices
INSERT INTO organisation_schema.offices (location_id, office_name, address, total_floors, created_at, created_by, deleted)
VALUES
(1, 'Tech Park - Building A', 'Outer Ring Road, Marathahalli, Bangalore - 560037', 5, CURRENT_TIMESTAMP, 'superadmin', false),
(1, 'Tech Park - Building B', 'Outer Ring Road, Marathahalli, Bangalore - 560037', 3, CURRENT_TIMESTAMP, 'superadmin', false),
(1, 'Innovation Hub', 'Electronic City Phase 1, Bangalore - 560100', 4, CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- Mumbai Offices
INSERT INTO organisation_schema.offices (location_id, office_name, address, total_floors, created_at, created_by, deleted)
VALUES
(2, 'BKC Corporate Tower', 'Bandra Kurla Complex, Mumbai - 400051', 6, CURRENT_TIMESTAMP, 'superadmin', false),
(2, 'Andheri Office', 'MIDC, Andheri East, Mumbai - 400093', 3, CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- Hyderabad Office
INSERT INTO organisation_schema.offices (location_id, office_name, address, total_floors, created_at, created_by, deleted)
VALUES
(3, 'Hitech City Campus', 'HITEC City, Madhapur, Hyderabad - 500081', 5, CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Insert Cafeterias for Offices
-- =====================================================

-- Building A Cafeterias
INSERT INTO organisation_schema.cafeterias (office_id, name, floor_number, opening_time, closing_time, capacity, is_active, created_at, created_by, deleted)
VALUES
(1, 'Main Cafeteria', 0, '08:00:00', '20:00:00', 200, true, CURRENT_TIMESTAMP, 'superadmin', false),
(1, 'Rooftop Cafe', 5, '09:00:00', '18:00:00', 80, true, CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- Building B Cafeterias
INSERT INTO organisation_schema.cafeterias (office_id, name, floor_number, opening_time, closing_time, capacity, is_active, created_at, created_by, deleted)
VALUES
(2, 'Food Court', 0, '08:00:00', '19:00:00', 150, true, CURRENT_TIMESTAMP, 'superadmin', false),
(2, 'Express Counter', 2, '10:00:00', '16:00:00', 50, true, CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- Innovation Hub Cafeteria
INSERT INTO organisation_schema.cafeterias (office_id, name, floor_number, opening_time, closing_time, capacity, is_active, created_at, created_by, deleted)
VALUES
(3, 'Innovation Cafe', 1, '08:30:00', '19:30:00', 120, true, CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- BKC Tower Cafeterias
INSERT INTO organisation_schema.cafeterias (office_id, name, floor_number, opening_time, closing_time, capacity, is_active, created_at, created_by, deleted)
VALUES
(4, 'Executive Dining', 0, '08:00:00', '21:00:00', 180, true, CURRENT_TIMESTAMP, 'superadmin', false),
(4, 'Quick Bites', 3, '09:00:00', '17:00:00', 60, true, CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Insert Org Admin Users
-- =====================================================

INSERT INTO identity_schema.users (username, full_name, email, password, role, organization_id, email_verified, phone_verified, status, profile_complete, created_at, created_by, deleted)
VALUES
('orgadmin1', 'Rajesh Kumar', 'rajesh.kumar@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_ORG_ADMIN', 1, true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'superadmin', false),
('orgadmin2', 'Priya Sharma', 'priya.sharma@innovatetech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_ORG_ADMIN', 2, true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'superadmin', false)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- Insert Vendor Users
-- =====================================================

INSERT INTO identity_schema.users (username, full_name, email, phone_number, password, role, organization_id, shop_name, gst_number, email_verified, phone_verified, status, profile_complete, created_at, created_by, deleted)
VALUES
('vendor1', 'Amit Patel', 'amit.patel@spicekitchen.com', '+919876543210', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_VENDOR', 1, 'Spice Kitchen', '29ABCDE1234F1Z5', true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
('vendor2', 'Sneha Reddy', 'sneha.reddy@healthybites.com', '+919876543211', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_VENDOR', 1, 'Healthy Bites', '29ABCDE1234F2Z6', true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
('vendor3', 'Ravi Singh', 'ravi.singh@chaipoint.com', '+919876543212', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_VENDOR', 1, 'Chai Point', '29ABCDE1234F3Z7', true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
('vendor4', 'Kavita Desai', 'kavita.desai@southindiandelight.com', '+919876543213', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_VENDOR', 1, 'South Indian Delight', '29ABCDE1234F4Z8', true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
('vendor5', 'Arjun Mehta', 'arjun.mehta@pizzacorner.com', '+919876543214', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_VENDOR', 1, 'Pizza Corner', '29ABCDE1234F5Z9', true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- Insert Vendors
-- =====================================================

-- Get vendor user IDs and insert into vendors table
-- Assuming user IDs: superadmin=1, orgadmin1=2, orgadmin2=3, vendor1=4, vendor2=5, vendor3=6, vendor4=7, vendor5=8

INSERT INTO organisation_schema.vendors (owner_user_id, name, contact_person, contact_number, is_active, created_at, created_by, deleted)
VALUES
(4, 'Spice Kitchen', 'Amit Patel', '+919876543210', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(5, 'Healthy Bites', 'Sneha Reddy', '+919876543211', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(6, 'Chai Point', 'Ravi Singh', '+919876543212', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(7, 'South Indian Delight', 'Kavita Desai', '+919876543213', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(8, 'Pizza Corner', 'Arjun Mehta', '+919876543214', true, CURRENT_TIMESTAMP, 'orgadmin1', false)
ON CONFLICT (owner_user_id) DO NOTHING;

-- =====================================================
-- Insert Vendor-Cafeteria Mappings
-- =====================================================

-- Map vendors to cafeterias (Main Cafeteria - office_id=1)
INSERT INTO organisation_schema.vendor_cafeteria_mapping (vendor_id, cafeteria_id, stall_number, is_primary, is_active, created_at, created_by, deleted)
VALUES
(1, 1, 'S-01', true, true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(2, 1, 'S-02', true, true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(3, 1, 'S-03', true, true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(4, 1, 'S-04', true, true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(5, 1, 'S-05', true, true, CURRENT_TIMESTAMP, 'orgadmin1', false)
ON CONFLICT (vendor_id, cafeteria_id) DO NOTHING;

-- Map some vendors to Rooftop Cafe as well
INSERT INTO organisation_schema.vendor_cafeteria_mapping (vendor_id, cafeteria_id, stall_number, is_primary, is_active, created_at, created_by, deleted)
VALUES
(2, 2, 'R-01', false, true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(3, 2, 'R-02', false, true, CURRENT_TIMESTAMP, 'orgadmin1', false)
ON CONFLICT (vendor_id, cafeteria_id) DO NOTHING;

-- Map vendors to Food Court (office_id=2)
INSERT INTO organisation_schema.vendor_cafeteria_mapping (vendor_id, cafeteria_id, stall_number, is_primary, is_active, created_at, created_by, deleted)
VALUES
(1, 3, 'F-01', false, true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(4, 3, 'F-02', false, true, CURRENT_TIMESTAMP, 'orgadmin1', false),
(5, 3, 'F-03', false, true, CURRENT_TIMESTAMP, 'orgadmin1', false)
ON CONFLICT (vendor_id, cafeteria_id) DO NOTHING;

-- =====================================================
-- Insert Employee Users
-- =====================================================

INSERT INTO identity_schema.users (username, full_name, email, phone_number, password, role, employee_id, organization_id, office_id, email_verified, phone_verified, status, profile_complete, created_at, created_by, deleted)
VALUES
('employee1', 'Vikram Sharma', 'vikram.sharma@techcorp.com', '+919876543220', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_EMPLOYEE', 'EMP001', 1, 1, true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
('employee2', 'Anita Rao', 'anita.rao@techcorp.com', '+919876543221', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_EMPLOYEE', 'EMP002', 1, 1, true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
('employee3', 'Sanjay Kumar', 'sanjay.kumar@techcorp.com', '+919876543222', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_EMPLOYEE', 'EMP003', 1, 2, true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
('employee4', 'Meera Nair', 'meera.nair@techcorp.com', '+919876543223', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_EMPLOYEE', 'EMP004', 1, 2, true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false),
('employee5', 'Rahul Verma', 'rahul.verma@techcorp.com', '+919876543224', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_EMPLOYEE', 'EMP005', 1, 3, true, true, 'ACTIVE', true, CURRENT_TIMESTAMP, 'orgadmin1', false)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- MENU SCHEMA - Sample Menu Items
-- =====================================================

-- Categories for Spice Kitchen (vendor_id=1)
INSERT INTO menu_schema.categories (vendor_id, name, description, display_order, is_active, created_at, created_by, deleted)
VALUES
(1, 'Starters', 'Delicious appetizers to start your meal', 1, true, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 'Main Course', 'Hearty main dishes', 2, true, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 'Breads', 'Freshly baked breads', 3, true, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 'Beverages', 'Refreshing drinks', 4, true, CURRENT_TIMESTAMP, 'vendor1', false)
ON CONFLICT DO NOTHING;

-- Menu Items for Spice Kitchen
INSERT INTO menu_schema.menu_items (vendor_id, category_id, name, description, price, is_available, is_veg, is_promoted, created_at, created_by, deleted)
VALUES
(1, 1, 'Paneer Tikka', 'Grilled cottage cheese with spices', 180.00, true, true, true, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 1, 'Chicken Tikka', 'Tandoori chicken pieces', 220.00, true, false, true, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 2, 'Paneer Butter Masala', 'Cottage cheese in rich tomato gravy', 250.00, true, true, false, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 2, 'Chicken Biryani', 'Aromatic rice with tender chicken', 280.00, true, false, true, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 2, 'Dal Makhani', 'Creamy black lentils', 180.00, true, true, false, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 3, 'Butter Naan', 'Soft flatbread with butter', 40.00, true, true, false, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 3, 'Garlic Naan', 'Naan with garlic topping', 50.00, true, true, false, CURRENT_TIMESTAMP, 'vendor1', false),
(1, 4, 'Lassi', 'Traditional yogurt drink', 60.00, true, true, false, CURRENT_TIMESTAMP, 'vendor1', false)
ON CONFLICT DO NOTHING;

-- Categories for Healthy Bites (vendor_id=2)
INSERT INTO menu_schema.categories (vendor_id, name, description, display_order, is_active, created_at, created_by, deleted)
VALUES
(2, 'Salads', 'Fresh and healthy salads', 1, true, CURRENT_TIMESTAMP, 'vendor2', false),
(2, 'Smoothies', 'Nutritious smoothies', 2, true, CURRENT_TIMESTAMP, 'vendor2', false),
(2, 'Bowls', 'Wholesome grain bowls', 3, true, CURRENT_TIMESTAMP, 'vendor2', false)
ON CONFLICT DO NOTHING;

-- Menu Items for Healthy Bites
INSERT INTO menu_schema.menu_items (vendor_id, category_id, name, description, price, is_available, is_veg, is_promoted, created_at, created_by, deleted)
VALUES
(2, 5, 'Caesar Salad', 'Classic caesar with croutons', 180.00, true, true, true, CURRENT_TIMESTAMP, 'vendor2', false),
(2, 5, 'Greek Salad', 'Fresh vegetables with feta cheese', 200.00, true, true, false, CURRENT_TIMESTAMP, 'vendor2', false),
(2, 6, 'Berry Blast', 'Mixed berries smoothie', 120.00, true, true, true, CURRENT_TIMESTAMP, 'vendor2', false),
(2, 6, 'Green Detox', 'Spinach and kale smoothie', 140.00, true, true, false, CURRENT_TIMESTAMP, 'vendor2', false),
(2, 7, 'Quinoa Bowl', 'Quinoa with roasted vegetables', 220.00, true, true, true, CURRENT_TIMESTAMP, 'vendor2', false)
ON CONFLICT DO NOTHING;

-- Categories for Chai Point (vendor_id=3)
INSERT INTO menu_schema.categories (vendor_id, name, description, display_order, is_active, created_at, created_by, deleted)
VALUES
(3, 'Chai', 'Traditional Indian tea', 1, true, CURRENT_TIMESTAMP, 'vendor3', false),
(3, 'Coffee', 'Premium coffee blends', 2, true, CURRENT_TIMESTAMP, 'vendor3', false),
(3, 'Snacks', 'Quick bites', 3, true, CURRENT_TIMESTAMP, 'vendor3', false)
ON CONFLICT DO NOTHING;

-- Menu Items for Chai Point
INSERT INTO menu_schema.menu_items (vendor_id, category_id, name, description, price, is_available, is_veg, is_promoted, created_at, created_by, deleted)
VALUES
(3, 8, 'Masala Chai', 'Spiced Indian tea', 30.00, true, true, true, CURRENT_TIMESTAMP, 'vendor3', false),
(3, 8, 'Ginger Chai', 'Tea with fresh ginger', 35.00, true, true, false, CURRENT_TIMESTAMP, 'vendor3', false),
(3, 9, 'Cappuccino', 'Classic Italian coffee', 80.00, true, true, true, CURRENT_TIMESTAMP, 'vendor3', false),
(3, 9, 'Latte', 'Smooth espresso with milk', 90.00, true, true, false, CURRENT_TIMESTAMP, 'vendor3', false),
(3, 10, 'Samosa', 'Crispy fried pastry', 25.00, true, true, false, CURRENT_TIMESTAMP, 'vendor3', false),
(3, 10, 'Pakora', 'Mixed vegetable fritters', 40.00, true, true, false, CURRENT_TIMESTAMP, 'vendor3', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- WALLET SCHEMA - Initialize Wallets for Employees
-- =====================================================

-- Initialize wallets for employees with starting balance
INSERT INTO wallet_schema.user_wallets (user_id, balance, total_credited, total_debited, is_active, created_at, updated_at, created_by)
VALUES
(9, 1000.00, 1000.00, 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'orgadmin1'),
(10, 1000.00, 1000.00, 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'orgadmin1'),
(11, 1000.00, 1000.00, 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'orgadmin1'),
(12, 1000.00, 1000.00, 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'orgadmin1'),
(13, 1000.00, 1000.00, 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'orgadmin1')
ON CONFLICT (user_id) DO NOTHING;

-- Initial credit transactions
INSERT INTO wallet_schema.wallet_transactions (wallet_id, transaction_type, amount, balance_before, balance_after, description, created_at, created_by)
VALUES
(1, 'CREDIT', 1000.00, 0.00, 1000.00, 'Initial wallet credit', CURRENT_TIMESTAMP, 'orgadmin1'),
(2, 'CREDIT', 1000.00, 0.00, 1000.00, 'Initial wallet credit', CURRENT_TIMESTAMP, 'orgadmin1'),
(3, 'CREDIT', 1000.00, 0.00, 1000.00, 'Initial wallet credit', CURRENT_TIMESTAMP, 'orgadmin1'),
(4, 'CREDIT', 1000.00, 0.00, 1000.00, 'Initial wallet credit', CURRENT_TIMESTAMP, 'orgadmin1'),
(5, 'CREDIT', 1000.00, 0.00, 1000.00, 'Initial wallet credit', CURRENT_TIMESTAMP, 'orgadmin1')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PENDING APPROVALS - Sample Pending Users
-- =====================================================

-- Pending Vendor Users
INSERT INTO identity_schema.users (username, full_name, email, phone_number, password, role, organization_id, shop_name, gst_number, email_verified, phone_verified, status, profile_complete, created_at, created_by, deleted)
VALUES
('pending_vendor1', 'Karthik Iyer', 'karthik.iyer@burgerhouse.com', '+919876543230', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_VENDOR', 1, 'Burger House', '29ABCDE1234F6Z1', true, true, 'PENDING_APPROVAL', false, CURRENT_TIMESTAMP, 'system', false),
('pending_vendor2', 'Lakshmi Menon', 'lakshmi.menon@dessertcorner.com', '+919876543231', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_VENDOR', 1, 'Dessert Corner', '29ABCDE1234F7Z2', true, true, 'PENDING_APPROVAL', false, CURRENT_TIMESTAMP, 'system', false)
ON CONFLICT (username) DO NOTHING;

-- Pending Employee Users
INSERT INTO identity_schema.users (username, full_name, email, phone_number, password, role, employee_id, organization_id, office_id, email_verified, phone_verified, status, profile_complete, created_at, created_by, deleted)
VALUES
('pending_emp1', 'Neha Gupta', 'neha.gupta@techcorp.com', '+919876543232', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_EMPLOYEE', 'EMP006', 1, 1, true, true, 'PENDING_APPROVAL', false, CURRENT_TIMESTAMP, 'system', false),
('pending_emp2', 'Aditya Singh', 'aditya.singh@techcorp.com', '+919876543233', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'ROLE_EMPLOYEE', 'EMP007', 1, 2, true, true, 'PENDING_APPROVAL', false, CURRENT_TIMESTAMP, 'system', false)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- END OF SAMPLE DATA
-- =====================================================

-- Verify insertion counts
DO $$
BEGIN
    RAISE NOTICE 'Sample data insertion completed!';
    RAISE NOTICE 'Organizations: %', (SELECT COUNT(*) FROM organisation_schema.organizations);
    RAISE NOTICE 'Locations: %', (SELECT COUNT(*) FROM organisation_schema.locations);
    RAISE NOTICE 'Offices: %', (SELECT COUNT(*) FROM organisation_schema.offices);
    RAISE NOTICE 'Cafeterias: %', (SELECT COUNT(*) FROM organisation_schema.cafeterias);
    RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM identity_schema.users);
    RAISE NOTICE 'Vendors: %', (SELECT COUNT(*) FROM organisation_schema.vendors);
    RAISE NOTICE 'Vendor Mappings: %', (SELECT COUNT(*) FROM organisation_schema.vendor_cafeteria_mapping);
    RAISE NOTICE 'Menu Items: %', (SELECT COUNT(*) FROM menu_schema.menu_items);
    RAISE NOTICE 'Pending Approvals: %', (SELECT COUNT(*) FROM identity_schema.users WHERE status = 'PENDING_APPROVAL');
END $$;
