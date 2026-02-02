# Soka Education EXPO - Walkthrough

I have successfully built the **Education Practice Party** registration website with the following features:

## 🌟 Key Features
- **Visual Design**: High-quality "Glassmorphism" UI with animated gradients and responsive layout.
- **Session Logic**: Strict enforcement of A+B, C, and D selection rules.
    - If C (Workshop) is selected, you cannot select A, B, or D.
    - If A (Main) is selected, B (Lecture) is encouraged/required.
- **Real-Time Data**: Live slot capacity tracking via Firebase Firestore.
- **Concurrency Handling**: Transaction-based booking ensures no overbooking even with simultaneous users.
- **Registration Form**: Collects Name, Phone, and Email.

## 🛠️ How to Verify
1. **Start the App**:
   The development server is running at [http://localhost:5173](http://localhost:5173).
   If stopped, run:
   ```bash
   npm run dev
   ```

2. **Seed Data (First Time Only)**:
   - I have added a **"Dev: Seed DB"** button at the bottom right of the screen.
   - Click it ONCE to populate the initial session slots (A1, A2, B1, C1, D1, etc.).
   - You only need to do this once per project (unless you clear Firestore).

3. **Test Constraints**:
   - Try clicking **C**. Notice A and B become dimmed/unselectable.
   - Try clicking **A**. Notice you can select **B**.
   - Select a full set and click "Next".

4. **Test Booking**:
   - Fill in the form and submit.
   - You will see the "Remaining" count decrease on the main screen.

## 🔒 Security & Deployment
- **API Keys**: Stored in `.env` and secured via `firestore.rules`.
- **Rules File**: A `firestore.rules` file has been created in the root for you to deploy.


## 📊 Admin Dashboard (New)
A comprehensive backend dashboard for administrators:
- **Real-time Charts**: Displays session popularity using `recharts`.
- **Excel Export**: Download complete booking data with one click (`xlsx`).
- **Data Initialization**: "Seed Button" moved to system tools area within the dashboard.

## 🔄 Data Integrity
- **Updated Session Data**: All session titles and descriptions (3F A/B) now perfectly match the HTML source document.
- **Real-time Sync**: `useSlots` hook ensures all clients see updated capacities instantly without refreshing.

## 🎫 Digital Ticket
- **QR Code Generation**: Automatically generates a unique QR code for each booking using `qrcode.react`.
- **Privacy-First**: Proof of registration without exposing full personal details on the main screen.
- **Image Download**: Integrated `html2canvas` to capture the ticket as a high-resolution PNG image, perfect for saving to mobile photo albums.

## 🔒 Security & Constraints
- **Device Restriction**: Implemented a `localStorage` lock mechanism to prevent duplicate registrations.
    - **Admin Reset**: Hidden trigger for admins to clear device lock.
        - Action: Click "Booking ID" label 5 times.
        - Password: `soka2026` or `admin`.

## 🛡️ User Protection
- **Double Confirmation**:
    - Before submission, a prompt summarizes selected sessions.
    - Explicitly warns users about the device lock to prevent accidental binding.

## 🎨 Design & UI/UX
- **Pro Max Aesthetic**: Applied to Digital Ticket with:
    - Linear gradients & Glassmorphism.
    - Smooth animations using `framer-motion`.
    - Interactive hover states.
    - Optimized RWD layout for mobile devices.
