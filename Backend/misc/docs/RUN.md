# Run FarmSync

The app runs **frontend-only** with mock data (no backend server). ML model and datasets are in the project root (`ml/`, `Dataset/`).

## One-time setup

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

## Run the app

From the project root:

```bash
npm run dev
```

Then open **http://localhost:5173** in your browser.

- **Login:** `admin@farmsync.com` / `admin123` or `farmer@test.com` / `farmer123`
- You can also register a new account (stored locally).

## If port 5173 is in use

1. Close any other terminal where you ran `npm run dev`.
2. Free the port (PowerShell):
   ```powershell
   Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
   ```
3. Run again: `npm run dev`
