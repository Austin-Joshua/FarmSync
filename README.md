# 🌾 FarmSync V2.0 - Modern Digital Farm Record Management System

**Version:** V2.0 (Modernized Tech Stack)  
**Status:** ✅ Production Ready | Stable Backend | Zustand State Management

---

## 👨‍🌾 Welcome to FarmSync V2.0 - Your Complete Farm Management Solution

FarmSync V2.0 is your **all-in-one digital farming assistant**. This version has been completely modernized with a **Spring Boot** backend and **React/Zustand** frontend to provide a seamless, high-performance experience for tracking crops, expenses, weather, and yielding data.

### Why Use FarmSync V2.0?

✅ **Modern Architecture** - Powered by Spring Boot 3 & React 18  
✅ **Fast State Management** - Lightweight, responsive UI with Zustand  
✅ **Cloud Integration** - Seamlessly connected with Supabase/PostgreSQL  
✅ **Null-Safe & Stable** - Rigorously audited for backend stability  
✅ **Multi-Language Support** - Native support for 6+ languages  
✅ **Enterprise Security** - JWT-based authentication and role-based access control

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** (Vite) - Modern UI framework
- **Zustand** - High-performance state management
- **TypeScript** - Full type safety
- **Tailwind CSS 3.4** - Modern, responsive styling
- **React Router 7.12** - Client-side routing
- **Recharts 3.6** - Data visualization
- **Leaflet** - Interactive field maps
- **i18next** - Comprehensive multi-language support

### Backend
- **Java 17** - Long-term support runtime
- **Spring Boot 3.2.4** - Enterprise web framework
- **PowerShell Maven Wrapper** - Standardized build environment
- **Spring Data JPA** - Robust database abstraction
- **Spring Security** - Advanced JWT authentication
- **jjwt 0.12** - Secure token handling
- **Lombok** - Boilerplate reduction

### Database
- **PostgreSQL** (Supabase) - Highly available relational database
- **Flyway-ready Schema** - Organized database migrations

---

## 🚀 Quick Start

### Prerequisites
- **Java 17+** (JDK)
- **Node.js 18+**
- **Docker** (Optional, for local DB)

### Installation

**1. Clone the Repository**
```bash
git clone https://github.com/Austin-Joshua/FarmSync.git
cd FarmSync
```

**2. Setup Backend (Port 8080)**
```powershell
cd server
.\mvnw.cmd clean spring-boot:run
# Backend will be available at http://localhost:8080
```

**3. Setup Frontend (Port 5173)**
```bash
cd client
npm install
npm run dev
# Frontend will be available at http://localhost:5173
```

---

## 📁 Project Structure

```
FarmSync/
├── client/                     # React application (Zustand)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page views
│   │   ├── store/             # Zustand state stores
│   │   ├── services/          # API communication
│   │   └── i18n/              # Language translation files
│   └── package.json
│
├── server/                     # Spring Boot Application
│   ├── src/main/java/
│   │   └── com/farmsync/
│   │       ├── config/        # Security & App config
│   │       ├── controller/    # REST API Endpoints
│   │       ├── model/         # JPA Entities
│   │       ├── repository/    # Data Access Layer
│   │       ├── security/      # JWT Filter & Auth logic
│   │       └── service/       # Business Logic
│   └── pom.xml
│
├── supabase/                   # Database schema & migrations
│   └── schema.sql
│
└── README.md
```

---

## ✨ Features

- ✅ **Smart Authentication** - Secure JWT login, registration, and session management.
- ✅ **Farm & Field Management** - GPS-tagged field mapping and soil type tracking.
- ✅ **Full Crop Lifecycle** - Plan, track, and analyze crop growth from sowing to harvest.
- ✅ **Financial Intelligence** - Detailed expense/income recording with analytics.
- ✅ **Yield Analytics** - Automated production metrics and seasonal comparisons.
- ✅ **Multi-Language** - Switch between English, Tamil, Hindi, and more instantly.
- ✅ **Responsive Design** - Full desktop and mobile experience.

---

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Austin Joshua** - *Full Stack Developer*
GitHub: [@Austin-Joshua](https://github.com/Austin-Joshua)

---

**Happy Farming! 🌾**
