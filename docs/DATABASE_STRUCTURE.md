# MySQL Database Structure

## Database Information
- **Name**: farmsync_db
- **Type**: MySQL
- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Password**: 123456

## Tables for User Profiles & History

### 1. users (User Profiles)
Stores all user account information:
- `id` - Unique user ID (UUID)
- `name` - User's full name
- `email` - Email address (unique)
- `password_hash` - Encrypted password
- `role` - 'farmer' or 'admin'
- `location` - User's location
- `google_id` - Google OAuth ID (optional)
- `picture_url` - Profile picture URL
- `created_at` - Account creation date
- `updated_at` - Last update date

### 2. user_settings (User Preferences)
Stores user-specific settings:
- `user_id` - Links to users table
- `enable_history_saving` - Auto-save history preference
- `auto_save_stock_records` - Auto-save stock records
- `auto_save_income_records` - Auto-save income records
- `notifications_enabled` - Notification preferences
- `theme` - UI theme ('light' or 'dark')

### 3. monthly_income (Income History)
Stores monthly income records:
- `user_id` - Links to users table
- `month` - Month (1-12)
- `year` - Year
- `total_income` - Total income for the month
- `crops_sold` - Number of crops sold
- `average_price` - Average price per crop
- `created_at` - Record creation date
- `updated_at` - Last update date

### 4. monthly_stock_usage (Stock History)
Stores monthly stock usage records:
- `user_id` - Links to users table
- `item_name` - Name of the item
- `item_type` - Type ('seeds', 'fertilizer', 'pesticide')
- `quantity_used` - Quantity used in the month
- `remaining_stock` - Remaining stock after usage
- `unit` - Unit of measurement
- `month` - Month (1-12)
- `year` - Year
- `date_recorded` - Date when recorded

### 5. crop_recommendations (ML Recommendations History)
Stores ML crop recommendations:
- `user_id` - Links to users table
- `farm_id` - Links to farms table (optional)
- `n_value`, `p_value`, `k_value` - Soil nutrients
- `temperature`, `humidity`, `ph`, `rainfall` - Environmental data
- `recommended_crop` - ML recommended crop
- `confidence` - Confidence score (0-1)
- `created_at` - Recommendation date

## All Data Tables (15 total)

1. **users** - User profiles
2. **user_settings** - User preferences
3. **farms** - Farm/land information
4. **crops** - Crop records
5. **crop_types** - Crop master data
6. **expenses** - Expense records
7. **yields** - Yield records
8. **stock_items** - Current stock inventory
9. **monthly_income** - Income history
10. **monthly_stock_usage** - Stock usage history
11. **crop_recommendations** - ML recommendations history
12. **fertilizers** - Fertilizer usage
13. **pesticides** - Pesticide usage
14. **irrigations** - Irrigation records
15. **soil_types** - Soil type master data

## Data Persistence

✅ **All user data is stored in MySQL database**
✅ **All history records are stored in MySQL database**
✅ **All farm records are stored in MySQL database**
✅ **All ML recommendations are stored in MySQL database**

Nothing is stored in localStorage or mock data - everything persists in the database!
