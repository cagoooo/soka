# Implementation Plan - Digital Ticket (QR Code)

## Goal Description
Implement a "Digital Ticket" view that appears after successful registration. This ticket will display a QR code containing the booking ID and a summary of the registered sessions, allowing users to screenshot or print it as a proof of registration.

## Proposed Changes

### Components

#### [NEW] [TicketView.tsx](file:///H:/Soka/src/components/TicketView.tsx)
-   **Props**: `bookingId`, `userDetails` (name, phone), `selectedSlotIds` (array of strings).
-   **Logic**:
    -   Use `useSlots()` hook to fetch slot definitions.
    -   Map `selectedSlotIds` to actual slot objects (Title, Time, Location).
    -   Render a "Ticket" card with:
        -   Event Title (2026 創價・教育 EXPO)
        -   User Name & Phone (masked privacy?)
        -   QR Code (using `qrcode.react`) encoding the `bookingId`.
        -   List of selected sessions (Time - Location - Title).
        -   "Save / Print" button.
        -   [NEW] "Download Image" button (using `html2canvas`).
            -   Captures the ticket DOM element.
            -   Converts to blob/dataURL.
            -   Triggers a download of "Soka_Ticket_[ID].png".

#### [MODIFY] [App.tsx](file:///H:/Soka/src/App.tsx)
-   State: Add `ticketData` state (`{ id, details, slotIds } | null`).
-   `handleConfirm`:
    -   Capture the returned `bookingId`.
    -   Derive `slotIds` from `selection` object.
    -   [NEW] **Confirmation Alert**:
        -   In `handleConfirm`:
        -   Fetch full slot details using `useSlots`.
        -   Construct a string summary of selected titles.
        -   Show `window.confirm` with summary + "Device Binding Warning".
        -   Only proceed if `true`.
    -   Render:
        -   If `ticketData` exists, show `<TicketView />` and hide the main selection UI.
    -   [NEW] **Device Restriction**:
        -   On `useEffect` mount: Check `localStorage.getItem('soka_ticket')`.
        -   If found, parse and set `ticketData` immediately (Blocking new registrations).
        -   On successful confirm: `localStorage.setItem('soka_ticket', JSON.stringify(ticketData))`.
        -   Add a "Reset/Clear" mechanism (only for Admin or specific debug action) if strictly needed, otherwise users must clear cache to re-book.

## Verification Plan

### Manual Verification
1.  **Registration Flow**:
    -   Select sessions (e.g., A+B).
    -   Fill form and submit.
2.  **Ticket Display**:
    -   Verify the form disappears and `TicketView` appears.
    -   Check if the QR Code is generated.
    -   Check if the session details (Title, Time, Location) match the selection.
3.  **Persistence (Optional/Future)**:
    -   Refresh page -> Ticket is gone (current expected behavior, as we don't hold session).
    -   *Future*: Could store in `localStorage` if needed, but not in scope for now.

# Phase 2: Optimization & Admin Tools

## Goal Description
Enhance administrative capabilities with Excel export, improve user experience with real-time seat updates, and boost social media visibility with Open Graph tags.

## Proposed Changes

### [Admin] Excel Export
#### [MODIFY] [AdminDashboard.tsx](file:///H:/Soka/src/components/AdminDashboard.tsx)
-   **Dependency**: `xlsx` (already installed).
-   **Function**: `handleExport`
    -   Fetch all documents from `bookings` collection.
    -   Flatten data object (e.g., `user.name` -> `姓名`, `slotId` -> `場次`).
    -   Create worksheet: `XLSX.utils.json_to_sheet(data)`.
    -   Create workbook and append sheet.
    -   Trigger download: `XLSX.writeFile(wb, "Soka_Bookings_[Date].xlsx")`.

### [UX] Real-time Updates
#### [MODIFY] [useSlots.ts](file:///H:/Soka/src/hooks/useSlots.ts)
-   **Change**: Replace `getDocs` (pull) with `onSnapshot` (push).
-   **Logic**:
    -   In `useEffect`, subscribe to `collection(db, 'slots')`.
    -   Update `slots` state whenever snapshot updates.
    -   Return `unsubscribe` function for cleanup.
    -   Ensure `loading` state is handled correctly (false after first snapshot).

### [Marketing] Social Media OG Tags
#### [MODIFY] [index.html](file:///H:/Soka/index.html)
-   Add `<meta>` tags in `<head>`:
    -   `og:title`: "2026 創價・教育 EXPO | 教育實踐趴"
    -   `og:description`: "探索創價教育的無限可能，立即線上報名參加！"
    -   `og:image`: Path to a preview image (need to create or select one).
    -   `og:url`: `https://cagoooo.github.io/soka/`
    -   `og:type`: `website`

## Verification Plan
1.  **Excel**: Log in as admin, click export, open file, verify columns and Chinese characters.
2.  **Real-time**: Open two browser windows. Book a slot in Window A. Verify Window B updates capacity instantly without refresh.
3.  **OG Tags**: Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or LINE to test the URL preview.
