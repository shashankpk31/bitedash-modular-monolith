-- =====================================================
-- BiteDash Modular Monolith - Complete Database Schema
-- Version: 1.0
-- Date: 2026-02-17
-- =====================================================
-- This script creates all schemas and tables for the BiteDash application
-- Compatible with PostgreSQL 12+
-- =====================================================

-- =====================================================
-- STEP 1: Create Schemas
-- =====================================================

CREATE SCHEMA IF NOT EXISTS identity_schema;
CREATE SCHEMA IF NOT EXISTS organisation_schema;
CREATE SCHEMA IF NOT EXISTS order_schema;
CREATE SCHEMA IF NOT EXISTS menu_schema;
CREATE SCHEMA IF NOT EXISTS wallet_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS inventory_schema;

-- =====================================================
-- STEP 2: Create ENUM Types (if using PostgreSQL ENUMs)
-- Note: Spring/Hibernate uses VARCHAR with @Enumerated(EnumType.STRING)
-- =====================================================

-- User roles enum
DO '
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = ''role_type'') THEN
        CREATE TYPE role_type AS ENUM (''ROLE_SUPER_ADMIN'', ''ROLE_ORG_ADMIN'', ''ROLE_VENDOR'', ''ROLE_EMPLOYEE'');
    END IF;
END;
';

-- User status enum
DO '
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = ''user_status_type'') THEN
        CREATE TYPE user_status_type AS ENUM (''ACTIVE'', ''PENDING_APPROVAL'', ''BLOCKED'');
    END IF;
END;
';

-- =====================================================
-- IDENTITY SCHEMA - User Management & Authentication
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS identity_schema.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    employee_id VARCHAR(100),
    organization_id BIGINT,
    shop_name VARCHAR(255),
    gst_number VARCHAR(50),
    phone_number VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    office_id BIGINT,
    status VARCHAR(50),
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- Indexes
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON identity_schema.users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_office_id ON identity_schema.users(office_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON identity_schema.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON identity_schema.users(status);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON identity_schema.users(deleted);

-- Identity audit log
CREATE TABLE IF NOT EXISTS identity_schema.audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(100),
    entity_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    changed_by VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_identity_audit_entity_name ON identity_schema.audit_log(entity_name);
CREATE INDEX IF NOT EXISTS idx_identity_audit_timestamp ON identity_schema.audit_log(timestamp);

-- =====================================================
-- ORGANISATION SCHEMA - Organizations, Locations, Offices, Cafeterias, Vendors
-- =====================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organisation_schema.organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_organizations_deleted ON organisation_schema.organizations(deleted);

-- Locations table
CREATE TABLE IF NOT EXISTS organisation_schema.locations (
    id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL,
    city_name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_locations_organization FOREIGN KEY (org_id)
        REFERENCES organisation_schema.organizations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_locations_org_id ON organisation_schema.locations(org_id);
CREATE INDEX IF NOT EXISTS idx_locations_deleted ON organisation_schema.locations(deleted);

-- Offices table
CREATE TABLE IF NOT EXISTS organisation_schema.offices (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL,
    office_name VARCHAR(255) NOT NULL,
    address TEXT,
    total_floors INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_offices_location FOREIGN KEY (location_id)
        REFERENCES organisation_schema.locations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offices_location_id ON organisation_schema.offices(location_id);
CREATE INDEX IF NOT EXISTS idx_offices_deleted ON organisation_schema.offices(deleted);

-- Cafeterias table
CREATE TABLE IF NOT EXISTS organisation_schema.cafeterias (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    floor_number INTEGER,
    opening_time TIME,
    closing_time TIME,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_cafeterias_office FOREIGN KEY (office_id)
        REFERENCES organisation_schema.offices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cafeterias_office_id ON organisation_schema.cafeterias(office_id);
CREATE INDEX IF NOT EXISTS idx_cafeterias_is_active ON organisation_schema.cafeterias(is_active);
CREATE INDEX IF NOT EXISTS idx_cafeterias_deleted ON organisation_schema.cafeterias(deleted);

-- Vendors table
CREATE TABLE IF NOT EXISTS organisation_schema.vendors (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id BIGINT UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_vendors_owner_user_id ON organisation_schema.vendors(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON organisation_schema.vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_deleted ON organisation_schema.vendors(deleted);

-- Vendor-Cafeteria Mapping table
CREATE TABLE IF NOT EXISTS organisation_schema.vendor_cafeteria_mapping (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    cafeteria_id BIGINT NOT NULL,
    stall_number VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_vcm_vendor FOREIGN KEY (vendor_id)
        REFERENCES organisation_schema.vendors(id) ON DELETE CASCADE,
    CONSTRAINT fk_vcm_cafeteria FOREIGN KEY (cafeteria_id)
        REFERENCES organisation_schema.cafeterias(id) ON DELETE CASCADE,
    CONSTRAINT uk_vendor_cafeteria UNIQUE (vendor_id, cafeteria_id)
);

CREATE INDEX IF NOT EXISTS idx_vcm_vendor_id ON organisation_schema.vendor_cafeteria_mapping(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vcm_cafeteria_id ON organisation_schema.vendor_cafeteria_mapping(cafeteria_id);
CREATE INDEX IF NOT EXISTS idx_vcm_is_active ON organisation_schema.vendor_cafeteria_mapping(is_active);

-- Vendor Operating Hours table
CREATE TABLE IF NOT EXISTS organisation_schema.vendor_operating_hours (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    day_of_week INTEGER NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_voh_vendor FOREIGN KEY (vendor_id)
        REFERENCES organisation_schema.vendors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_voh_vendor_id ON organisation_schema.vendor_operating_hours(vendor_id);
CREATE INDEX IF NOT EXISTS idx_voh_day_of_week ON organisation_schema.vendor_operating_hours(day_of_week);

-- Organisation audit log
CREATE TABLE IF NOT EXISTS organisation_schema.audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(100),
    entity_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    changed_by VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_org_audit_entity_name ON organisation_schema.audit_log(entity_name);
CREATE INDEX IF NOT EXISTS idx_org_audit_timestamp ON organisation_schema.audit_log(timestamp);

-- =====================================================
-- MENU SCHEMA - Menu Items, Categories, Promotions
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS menu_schema.categories (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    display_order INTEGER DEFAULT 999,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_categories_vendor_id ON menu_schema.categories(vendor_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON menu_schema.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_deleted ON menu_schema.categories(deleted);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_schema.menu_items (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    category_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_veg BOOLEAN DEFAULT TRUE,
    is_promoted BOOLEAN DEFAULT FALSE,
    promotion_rank INTEGER DEFAULT 999,
    promotion_start_date TIMESTAMP,
    promotion_end_date TIMESTAMP,
    promotion_type VARCHAR(50),
    spice_level VARCHAR(20),
    dietary_tags JSONB,
    popularity_score INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 999,
    calories INTEGER,
    preparation_time_minutes INTEGER,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id)
        REFERENCES menu_schema.categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_id ON menu_schema.menu_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_schema.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_schema.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_promoted ON menu_schema.menu_items(is_promoted);
CREATE INDEX IF NOT EXISTS idx_menu_items_deleted ON menu_schema.menu_items(deleted);

-- Menu Item Addons table
CREATE TABLE IF NOT EXISTS menu_schema.menu_item_addons (
    id BIGSERIAL PRIMARY KEY,
    menu_item_id BIGINT NOT NULL,
    addon_name VARCHAR(255) NOT NULL,
    extra_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_addons_menu_item FOREIGN KEY (menu_item_id)
        REFERENCES menu_schema.menu_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_addons_menu_item_id ON menu_schema.menu_item_addons(menu_item_id);

-- Promotions table
CREATE TABLE IF NOT EXISTS menu_schema.promotions (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    menu_item_id BIGINT,
    promotion_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    price_paid DECIMAL(10, 2) NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    orders_generated INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_promotions_menu_item FOREIGN KEY (menu_item_id)
        REFERENCES menu_schema.menu_items(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_promotions_vendor_id ON menu_schema.promotions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_promotions_menu_item_id ON menu_schema.promotions(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON menu_schema.promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON menu_schema.promotions(start_date, end_date);

-- Promotion Analytics table
CREATE TABLE IF NOT EXISTS menu_schema.promotion_analytics (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_analytics_promotion FOREIGN KEY (promotion_id)
        REFERENCES menu_schema.promotions(id) ON DELETE CASCADE,
    CONSTRAINT uk_promotion_analytics_date UNIQUE (promotion_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_promotion_id ON menu_schema.promotion_analytics(promotion_id);

-- Menu audit log
CREATE TABLE IF NOT EXISTS menu_schema.audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(100),
    entity_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    changed_by VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_menu_audit_entity_name ON menu_schema.audit_log(entity_name);
CREATE INDEX IF NOT EXISTS idx_menu_audit_timestamp ON menu_schema.audit_log(timestamp);

-- =====================================================
-- ORDER SCHEMA - Orders, Order Items, Order History
-- =====================================================

-- Orders table
CREATE TABLE IF NOT EXISTS order_schema.orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code_data VARCHAR(500) UNIQUE,
    user_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    cafeteria_id BIGINT,
    office_id BIGINT,
    organization_id BIGINT,
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_commission DECIMAL(10, 2) DEFAULT 0.00,
    vendor_payout DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    commission_rate DECIMAL(5, 4) DEFAULT 0.15,
    status VARCHAR(50) DEFAULT 'PENDING',
    order_type VARCHAR(50) DEFAULT 'DINE_IN',
    pickup_otp VARCHAR(6),
    scheduled_time TIMESTAMP,
    preparation_time INTEGER,
    special_instructions TEXT,
    rating INTEGER,
    feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON order_schema.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON order_schema.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON order_schema.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON order_schema.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON order_schema.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_deleted ON order_schema.orders(deleted);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_schema.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    menu_item_name VARCHAR(200),
    addon_ids TEXT,
    customizations JSONB,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    subtotal DECIMAL(10, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
        REFERENCES order_schema.orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_schema.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_schema.order_items(menu_item_id);

-- Order Status History table
CREATE TABLE IF NOT EXISTS order_schema.order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT,
    changed_by_role VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_history_order FOREIGN KEY (order_id)
        REFERENCES order_schema.orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_status_history_order_id ON order_schema.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON order_schema.order_status_history(created_at);

-- Order audit log
CREATE TABLE IF NOT EXISTS order_schema.audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(100),
    entity_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    changed_by VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_audit_entity_name ON order_schema.audit_log(entity_name);
CREATE INDEX IF NOT EXISTS idx_order_audit_timestamp ON order_schema.audit_log(timestamp);

-- =====================================================
-- WALLET SCHEMA - User Wallets & Transactions
-- =====================================================

-- User Wallets table
CREATE TABLE IF NOT EXISTS wallet_schema.user_wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON wallet_schema.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_deleted ON wallet_schema.user_wallets(deleted);

-- Wallet Transactions table
CREATE TABLE IF NOT EXISTS wallet_schema.wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    txn_type VARCHAR(20) NOT NULL,
    reference_id BIGINT,
    reference_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'SUCCESS',
    description VARCHAR(255),
    provider_reference_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_transactions_wallet FOREIGN KEY (wallet_id)
        REFERENCES wallet_schema.user_wallets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallet_txn_wallet_id ON wallet_schema.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_txn_type ON wallet_schema.wallet_transactions(txn_type);
CREATE INDEX IF NOT EXISTS idx_wallet_txn_created_at ON wallet_schema.wallet_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_txn_reference ON wallet_schema.wallet_transactions(reference_id, reference_type);

-- Wallet audit log
CREATE TABLE IF NOT EXISTS wallet_schema.audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(100),
    entity_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    changed_by VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_wallet_audit_entity_name ON wallet_schema.audit_log(entity_name);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_timestamp ON wallet_schema.audit_log(timestamp);

-- =====================================================
-- PAYMENT SCHEMA - Platform Revenue & Transactions
-- =====================================================

-- Platform Wallet table
CREATE TABLE IF NOT EXISTS payment_schema.platform_wallet (
    id BIGSERIAL PRIMARY KEY,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_commission_earned DECIMAL(15, 2) DEFAULT 0.00,
    total_gateway_markup_earned DECIMAL(15, 2) DEFAULT 0.00,
    total_promotion_spent DECIMAL(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Platform Revenue Log table
CREATE TABLE IF NOT EXISTS payment_schema.platform_revenue_log (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    vendor_id BIGINT,
    organization_id BIGINT,
    revenue_type VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    payment_id BIGINT,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_revenue_log_order_id ON payment_schema.platform_revenue_log(order_id);
CREATE INDEX IF NOT EXISTS idx_revenue_log_vendor_id ON payment_schema.platform_revenue_log(vendor_id);
CREATE INDEX IF NOT EXISTS idx_revenue_log_org_id ON payment_schema.platform_revenue_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_revenue_log_revenue_type ON payment_schema.platform_revenue_log(revenue_type);
CREATE INDEX IF NOT EXISTS idx_revenue_log_payment_id ON payment_schema.platform_revenue_log(payment_id);

-- Transactions table (for payment processing)
CREATE TABLE IF NOT EXISTS payment_schema.payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    gateway_fee DECIMAL(10, 2) DEFAULT 0.00,
    platform_markup DECIMAL(10, 2) DEFAULT 0.00,
    total_charged DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(50) DEFAULT 'ORDER_PAYMENT',
    currency VARCHAR(10) DEFAULT 'INR',
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature TEXT,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payment_schema.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payment_schema.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_schema.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payment_schema.payments(razorpay_order_id);

-- Payment audit log
CREATE TABLE IF NOT EXISTS payment_schema.audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(100),
    entity_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    changed_by VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_entity_name ON payment_schema.audit_log(entity_name);
CREATE INDEX IF NOT EXISTS idx_payment_audit_timestamp ON payment_schema.audit_log(timestamp);

-- =====================================================
-- INVENTORY SCHEMA - Stock Management
-- =====================================================

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory_schema.inventories (
    id BIGSERIAL PRIMARY KEY,
    cafeteria_id BIGINT NOT NULL,
    vendor_id BIGINT,
    item_name VARCHAR(255) NOT NULL,
    stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    min_stock_level DECIMAL(10, 2),
    max_stock_level DECIMAL(10, 2),
    reorder_quantity INTEGER,
    stock_status VARCHAR(50),
    expiry_date DATE,
    storage_location VARCHAR(100),
    supplier_name VARCHAR(255),
    supplier_contact VARCHAR(100),
    cost_per_unit DECIMAL(10, 2),
    last_restocked_at TIMESTAMP,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_inventory_cafeteria_id ON inventory_schema.inventories(cafeteria_id);
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_id ON inventory_schema.inventories(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_status ON inventory_schema.inventories(stock_status);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry_date ON inventory_schema.inventories(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory_schema.inventories(is_available);


-- Inventory Items table (menu item inventory tracking)
CREATE TABLE IF NOT EXISTS inventory_schema.inventory_items (
    id BIGSERIAL PRIMARY KEY,
    menu_item_id BIGINT,
    vendor_id BIGINT,
    available_quantity INTEGER,
    reserved_quantity INTEGER,
    threshold_limit INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS inventory_schema.purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    cafeteria_id BIGINT NOT NULL,
    vendor_id BIGINT,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    supplier_name VARCHAR(200) NOT NULL,
    supplier_contact VARCHAR(100),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_po_cafeteria_id ON inventory_schema.purchase_orders(cafeteria_id);
CREATE INDEX IF NOT EXISTS idx_po_vendor_id ON inventory_schema.purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON inventory_schema.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_po_number ON inventory_schema.purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_po_approved_by ON inventory_schema.purchase_orders(approved_by);

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS inventory_schema.purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    inventory_id BIGINT NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    received_quantity DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_po_items_purchase_order FOREIGN KEY (purchase_order_id)
        REFERENCES inventory_schema.purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_po_items_inventory FOREIGN KEY (inventory_id)
        REFERENCES inventory_schema.inventories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_po_items_po_id ON inventory_schema.purchase_order_items(purchase_order_id);

-- Inventory Transactions table
CREATE TABLE IF NOT EXISTS inventory_schema.inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    cost_per_unit DECIMAL(10, 2) DEFAULT 0.00,
    total_cost DECIMAL(10, 2) DEFAULT 0.00,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    remarks TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_inv_txn_inventory FOREIGN KEY (inventory_id)
        REFERENCES inventory_schema.inventories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inv_txn_inventory_id ON inventory_schema.inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inv_txn_created_at ON inventory_schema.inventory_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_inv_txn_type ON inventory_schema.inventory_transactions(transaction_type);

-- Inventory Alerts table
CREATE TABLE IF NOT EXISTS inventory_schema.inventory_alerts (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_alerts_inventory FOREIGN KEY (inventory_id)
        REFERENCES inventory_schema.inventories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alerts_inventory_id ON inventory_schema.inventory_alerts(inventory_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON inventory_schema.inventory_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON inventory_schema.inventory_alerts(severity);

-- Stock Log table
CREATE TABLE IF NOT EXISTS inventory_schema.stock_log (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id BIGINT,
    change_amount INTEGER,
    reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_stock_log_inventory_item FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_schema.inventory_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stock_log_inventory_item_id ON inventory_schema.stock_log(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_log_created_at ON inventory_schema.stock_log(created_at);

-- Inventory audit log
CREATE TABLE IF NOT EXISTS inventory_schema.audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(100),
    entity_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    changed_by VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_inventory_audit_entity_name ON inventory_schema.audit_log(entity_name);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_timestamp ON inventory_schema.audit_log(timestamp);

-- =====================================================
-- INITIAL DATA (Optional - for testing)
-- =====================================================

-- Insert platform wallet (singleton record)
INSERT INTO payment_schema.platform_wallet (balance, total_commission_earned, total_gateway_markup_earned, total_promotion_spent, updated_at)
VALUES (0.00, 0.00, 0.00, 0.00, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

