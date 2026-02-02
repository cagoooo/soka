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
