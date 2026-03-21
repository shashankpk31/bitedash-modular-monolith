-- Check if sample data exists in the database
-- Run this to verify if V2__insert_sample_data.sql has been executed

SELECT 'Organizations' as table_name, COUNT(*) as count FROM organisation_schema.organizations
UNION ALL
SELECT 'Locations', COUNT(*) FROM organisation_schema.locations
UNION ALL
SELECT 'Offices', COUNT(*) FROM organisation_schema.offices
UNION ALL
SELECT 'Cafeterias', COUNT(*) FROM organisation_schema.cafeterias
UNION ALL
SELECT 'Users', COUNT(*) FROM identity_schema.users
UNION ALL
SELECT 'Vendors', COUNT(*) FROM organisation_schema.vendors
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM menu_schema.menu_items
UNION ALL
SELECT 'Wallets', COUNT(*) FROM wallet_schema.user_wallets;

-- Show actual locations if any exist
SELECT 'Current Locations:' as info;
SELECT id, org_id, city_name, state, country, created_at
FROM organisation_schema.locations
ORDER BY id
LIMIT 10;
