# Full Deployment Guide: AI Parking Intelligence Dashboard

This guide walks you through deploying your entire application architecture.

## Deployment Architecture Overview
- **Database**: Railway PostgreSQL
- **Backend**: Railway FastAPI
- **Frontend**: Vercel React
- **Code Repository**: GitHub
- **Initial Data Import**: Local Python Script

---

## Step 1: Push Code to GitHub

1. Open your terminal in the project root directory.
2. Verify `.gitignore` exists and contains:
   ```text
   backend/.env
   frontend/.env
   data/original/parking_violations_full.csv
   backend/venv
   frontend/node_modules
   ```
3. Commit and push your code:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Database Setup & Data Import

### 1. Create the Database on Railway
1. Go to your [Railway Dashboard](https://railway.app/).
2. Click **New** -> **Database** -> **Add PostgreSQL**.
3. Once it's ready, click on the PostgreSQL service -> **Data** tab or **Variables** tab to find the connection details.
4. Look for the Public connection string, usually named `DATABASE_PUBLIC_URL` (it looks like `postgresql://postgres:...`). Copy it.

### 2. Initialize the Database Schema
You need to create your tables before importing data. Run this command in your terminal, replacing `YOUR_NEW_DATABASE_URL` with the connection string you just copied:
```bash
psql "YOUR_NEW_DATABASE_URL" -f database/init.sql
```

### 3. Import the Data
Before running the import script, ensure your python dependencies are installed (you've already done this, but here's the command just in case):
```bash
cd backend
pip install psycopg2-binary pandas python-dotenv
```
Next, **open `backend/import_large_csv.py`** and ensure you update it with your new `DATABASE_PUBLIC_URL` from Railway. 

Then run the import script:
```bash
python import_large_csv.py ../data/original/parking_violations_full.csv
```
*(Wait for the data to finish uploading to Railway).*

Navigate back to the root directory when done:
```bash
cd ..
```

---

## Step 3: Deploy Backend to Railway

1. Go to your [Railway Dashboard](https://railway.app/) and open the **Project** where you just created the PostgreSQL database.
2. Click the **+ New** button (usually at the top right or within the canvas) -> select **GitHub Repo** -> and select your `AIParkingIntelligenceDashboard` repository.
3. Configure the backend service:
   - Go to the **Settings** tab of the newly created service.
   - Under **Build**, set the **Root Directory** to `/backend`.
   - Under **Deploy**, set the **Start Command** to:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
4. Add Environment Variables:
   - Go to the **Variables** tab.
   - Add `DATABASE_URL` with your Railway connection string:
     ```text
     postgresql://postgres:hHNSvfPviaYibQntRBkQKvTEtOpskKTz@thomas.proxy.rlwy.net:51281/railway
     ```
5. Expose the Backend to the Internet:
   - Go to **Settings** -> **Networking**.
   - Click **Generate Domain**.
   - **Copy this domain** (e.g., `https://your-backend.up.railway.app`). You need it for Vercel.

---

## Step 4: Deploy Frontend to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the Project:
   - **Framework Preset**: Should auto-detect Vite or React.
   - **Root Directory**: Click "Edit" and select the `frontend` folder.
5. Add Environment Variables:
   - Expand the **Environment Variables** section.
   - Add **Name**: `VITE_API_BASE_URL`
   - Add **Value**: The public URL from Railway Step 3 (e.g., `https://your-backend.up.railway.app`). *(Make sure there is no trailing slash).*
6. Click **Deploy**.

Once Vercel finishes, you will get a public link to your dashboard!
