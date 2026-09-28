# Quickstart & Verification Guide: Organizer Authentication

## Local Testing Scenarios

### 1. Test 1-Click Demo Login

1. Open `http://localhost:3000/login`.
2. Click **"Quick Login as Demo Organizer"**.
3. Observe instant redirection to `http://localhost:3000/dashboard` with user Alex Gonzaga logged in.

### 2. Test Registration & Auto-Redirect

1. Open `http://localhost:3000/register`.
2. Enter Name, Email (`organizer.test@domain.ph`), and Password (`SecurePass123!`).
3. Click **"Create Organizer Account"**.
4. Confirm redirection to `/dashboard` with newly created organizer session.

### 3. Test Deep-Link ReturnTo Parameter

1. Open an incognito window.
2. Navigate directly to `http://localhost:3000/dashboard/events/new`.
3. Confirm automatic redirection to `http://localhost:3000/login?returnTo=%2Fdashboard%2Fevents%2Fnew`.
4. Log in and verify immediate navigation forward to `/dashboard/events/new`.

### 4. Test Sign-Out

1. In the dashboard header, click user avatar/menu and select **"Log Out"**.
2. Confirm session cookie is cleared and user is returned to `/login`.
