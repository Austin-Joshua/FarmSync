# FarmSync Backend API

Backend API for the Digital Farm Record Management System built with Node.js, Express.js, TypeScript, and MySQL.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=root
DB_PASSWORD=123456
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Database
```bash
npm run setup-db    # Creates database and tables
npm run seed         # Seeds initial data
```

### 4. Train ML Model (Optional)
```bash
cd ml
pip install -r requirements.txt
python train_model.py
cd ..
npm run add-ml-table
```

### 5. Start Server
```bash
npm run dev
```

## API Endpoints

- **Authentication**: `/api/auth/*`
- **Dashboard**: `/api/dashboard`
- **Farms**: `/api/farms/*`
- **Crops**: `/api/crops/*`
- **Expenses**: `/api/expenses/*`
- **Yields**: `/api/yields/*`
- **Stock**: `/api/stock/*`
- **History**: `/api/history/*`
- **Settings**: `/api/settings/*`
- **ML Recommendations**: `/api/ml/*`

## Default Credentials

- **Admin**: admin@farmsync.com / admin123
- **Farmer**: farmer@test.com / farmer123

## Database

- **Type**: MySQL
- **Port**: 3306
- **Database**: farmsync_db
- **User**: root
- **Password**: 123456

## ML Model

- **Accuracy**: 99.55%
- **Model**: Random Forest Classifier
- **Location**: `ml/crop_recommendation_model.pkl`
