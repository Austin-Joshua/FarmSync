# Contributing to FarmSync

Thank you for your interest in contributing to FarmSync! This guide will help you get set up quickly.

## Prerequisites

- **Java 17+** (JDK)
- **Node.js 20+** with npm
- **Python 3.11+**
- **Git**

## Quick Start

### 1. Fork & Clone
```bash
git clone https://github.com/Austin-Joshua/FarmSync.git
cd FarmSync
```

### 2. Configure Environment Variables
Copy the example env files and fill in your values:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# ML Service
cp ml-service/.env.example ml-service/.env
```

### 3. Start the Services
Start each service in a separate terminal:

**ML Service (Port 8000):**
```bash
cd ml-service
python -m venv .venv
.venv/Scripts/activate   # Windows
source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend (Port 9090):**
```bash
cd backend
./mvnw spring-boot:run   # Linux/macOS
mvnw.cmd spring-boot:run  # Windows
```

**Frontend (Port 5173):**
```bash
cd frontend
npm install
npm run dev
```

## Running Tests

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm run test

# ML Service
cd ml-service && pytest tests/ -v
```

## Branching Strategy

- `main` — stable, production-ready code
- `develop` — integration branch
- `feature/*` — new features (branch off `develop`)
- `fix/*` — bug fixes

## Pull Request Guidelines

1. **Always branch from `develop`**, not `main`
2. **Run all tests** before submitting a PR
3. **Write tests** for new features and bug fixes
4. **Follow the existing code style** — Java (Google Style Guide), TypeScript (ESLint config), Python (PEP8)
5. **Keep PRs focused** — one feature or fix per PR
6. **Update documentation** if you add or change a public API endpoint

## Code Quality Standards

- **Backend:** All new service methods must include ownership checks for user-scoped resources
- **Frontend:** All API calls must handle loading and error states
- **ML Service:** Any new ML endpoint must be protected by `verify_internal_secret`

## Reporting Bugs

Open a GitHub Issue with:
- Steps to reproduce
- Expected vs. actual behavior
- Environment (OS, Java/Node/Python version)
- Relevant logs

## Security Issues

**Do NOT** open public issues for security vulnerabilities. Email the maintainer directly.

## License

By contributing, you agree your contributions are licensed under the project's existing license.
