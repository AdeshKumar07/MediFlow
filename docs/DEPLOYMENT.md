# MediFlow — Production Deployment Guide

This guide details the step-by-step instructions for deploying MediFlow to production.

---

## 1. MongoDB Atlas Setup

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project named `MediFlow`.
3. Build a database:
   - Select the **FREE (Shared M0)** tier.
   - Choose a provider (AWS) and region close to your target users (e.g., `ap-south-1` for India).
4. Configure Security & Access:
   - **Database Access**: Create a database user with username/password. Keep these safe.
   - **Network Access**: Add IP address `0.0.0.0/0` to allow connections from Render hosting.
5. Get Connection String:
   - Go to **Database** → click **Connect** → choose **Drivers**.
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mediflow?retryWrites=true&w=majority
     ```

---

## 2. Render Backend Deployment

1. Sign in to [Render](https://render.com).
2. Click **New +** → select **Web Service**.
3. Connect your repository containing the MediFlow code.
4. Set Web Service configuration:
   - **Name**: `mediflow-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Region**: Select a region close to your MongoDB Atlas cluster.
   - **Build Command**: `npm install --production`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Configure Environment Variables in Render:
   - Add the following keys:
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: `<your MongoDB Atlas connection string>`
     - `JWT_ACCESS_SECRET`: `<64-byte random hex string>`
     - `JWT_REFRESH_SECRET`: `<64-byte random hex string>`
     - `JWT_ACCESS_EXPIRATION`: `15m`
     - `JWT_REFRESH_EXPIRATION`: `7d`
     - `ALLOWED_ORIGINS`: `<your Vercel frontend URL>` (e.g. `https://mediflow.vercel.app`)
     - `RAZORPAY_KEY_ID`: `<your Razorpay API Key>`
     - `RAZORPAY_KEY_SECRET`: `<your Razorpay API Secret>`
6. Deploy the service. Take note of the backend URL (e.g., `https://mediflow-api.onrender.com`).

---

## 3. Vercel Frontend Deployment

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your MediFlow repository.
4. Configure Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
5. Add Environment Variables in Vercel:
   - `VITE_API_URL`: `<your Render backend URL>` (without trailing slash, e.g., `https://mediflow-api.onrender.com`)
6. Click **Deploy**. Vercel will build and assign a deployment URL (e.g. `https://mediflow.vercel.app`).

---

## 4. Post-Deployment Verification

1. **Verify Backend Health**:
   - Access: `https://mediflow-api.onrender.com/health`
   - Response should be: `{"status":"ok", "env":"production", ...}`
2. **Verify Swagger API Docs**:
   - (If `DEBUG_DOCS` is enabled) Access: `https://mediflow-api.onrender.com/api/docs`
3. **Verify CORS**:
   - Access the Vercel frontend URL. Open Browser Console.
   - Verify that logging in or signing up does not trigger CORS exceptions.
