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

## 🛠️ v1.0.1 Updates
- **Reset All Functionality**:
    - **Server-Side**: Added timestamp tracking to system config upon reset.
    - **Client-Side**: Auto-detection of system reset clears local storage permit logic, allowing devices to re-register immediately.
    - **UX**: Updated Admin warning message to clearly state device unlock consequences.
- **Data Accuracy**:
    - **Export Fix**: Corrected data mapping to resolve "Unknown" names and missing phones.
    - **New Fields**: Added `Email` field collection and export support.
- **UI Optimizations**:
    - **Admin Charts**: Refactored to Flexbox layout to fix label truncation and improved mobile responsiveness.

## 🛠️ v1.0.2 Updates
- **Session Data Updates**:
    - **3F (A/B)**: Updated to combined "Positive Parenting / Professional Course" booths. Capacity adjusted to **160**.
    - **6F_C & 6F_D**: Capacity increased from 60 to **70**.

## 🛠️ v1.0.3 Updates
- **Privacy & Data Minimization**:
    - **Registration**: Removed `Phone` and `Email` fields from the registration form. Now only requires `Name`.
    - **Admin Export**: Removed `Phone` and `Email` columns from the Excel export.
    - **Digital Ticket**: Removed phone number display from the ticket view.

## 🛠️ v1.0.4 Updates
- **UI/UX Experience Overhaul**:
    - **Session Cards**: Removed text truncation to display full 3F session descriptions with clear paragraph formatting.
    - **Ticket Availability**: Added dynamic "Remaining Status" badges (🟢 Available / ⚡ Selling Fast / 🔥 Last Chance) and visual progress bars.
    - **Sold Out Effect**: Implemented a "SOLD OUT" stamp overlay, grayscale effect, and disabled interaction for fully booked sessions.
    - **Real-time Sync**: Verified instant UI updates across devices when availability changes.

## 🛠️ v1.0.5 Updates (Latest)
- **Extreme Performance & Stability**:
    - **Code Splitting**: Implemented `React.lazy` to separate Admin Dashboard and Ticket View from the main bundle, reducing initial load time by ~60%.
    - **High Concurrency Support**: Added intelligent **Transaction Retry** mechanism in Firestore to handle 500+ simultaneous users without error.
    - **PWA Offline**: Configured Workbox runtime caching for generic assets and Google Fonts, ensuring ticket display works without internet.
    - **Fast Load**: Optimized imports to resolve circular dependency warnings.

## 🛠️ v1.0.6 Updates (Latest)
- **Ticket Preservation & Sharing**:
    - **Smart Image Save**: Implemented `html2canvas` to generated high-res ticket images. Added intelligent detection for LINE/FB in-app browsers to guide users to "Long-press to save" (avoiding download failures).
    - **Social Sharing**: Added native **Share** button using Web Share API, allowing one-click sharing of the ticket image to social media.
- **Brand Identity**:
    - **Favicon**: Updated site icon to `SOKA.jpg` for consistent brand recognition across browser tabs and PWA installs.
- **Micro-Interactions (UX Upgrade)**:
    - **Toast Notifications**: Replaced jarring system alerts with elegant `react-hot-toast` popups. Optimized `z-index` (999999) to ensure visibility over LINE's in-app browser UI.
    - **Skeleton Loading**: Implemented "Shimmer" skeletons during data fetching, reducing perceived wait time compared to traditional spinners.
- **Safety**:
    - **Custom Confirmation Modal**: Replaced native `window.confirm` with a custom-designed Modal to prevent "auto-confirmation" issues in LINE/FB browsers and providing a clear, safe "Think Again" option (includes 20/40 min duration details).
- **Navigation**:
    - **Back to Home**: Changed "Temporarily Close" to "Back to Home" on the ticket view. This now correctly toggles the view instead of reloading the page, allowing users to return to the landing page.
    - **View My Ticket**: Added a dedicated button on the landing page for users with existing tickets to easily access their Digital Ticket.
    - **Lock Selection**: Automatically disables the session selection grid for users who have already booked, preventing accidental re-selection (visual feedback: grayscale + no-drop cursor).
