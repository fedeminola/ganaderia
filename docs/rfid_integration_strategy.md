# Bluetooth RFID Integration Strategy

This document outlines the strategy for integrating Bluetooth RFID readers (specifically TrueTest devices) into the GANADERA RFID web platform.

## 1. Core Principles

- **Simplicity**: The user experience must be seamless, requiring minimal technical knowledge. No manual file imports.
- **Mobile-First**: The solution must work flawlessly on mobile web browsers, as this is the primary use case in the field.
- **Decoupling**: The RFID reading logic will be decoupled from the main application logic through a dedicated service/hook on the frontend and a dedicated API endpoint on the backend.
- **Resilience**: The system must handle intermittent connectivity by using a local queue for scanned tags before syncing with the backend.

## 2. Proposed Technical Approach: Web Bluetooth API

The primary method for connecting to RFID readers will be the **Web Bluetooth API**.

- **How it works**: Modern web browsers can directly access nearby Bluetooth Low Energy (BLE) devices with the user's explicit permission. We can scan for the TrueTest reader, connect to it, and subscribe to its "characteristic" that notifies the application whenever a new RFID tag is scanned.

- **Advantages**:
    - **No extra software needed**: Works directly in the browser.
    - **Good UX**: The connection process is integrated into our web application.
    - **Platform Agnostic**: Works on Android Chrome and other supporting browsers on various devices.

- **Constraints & Mitigations**:
    - **Browser Support**: The Web Bluetooth API is not universally supported (e.g., not on iOS browsers). This is the main drawback. (See Section 4: Fallback Strategy).
    - **Security**: Requires an `https` connection, which is standard for production applications. The user must grant permission for every connection, which is a good security practice.
    - **Device Compatibility**: We will initially target TrueTest devices, abstracting the connection logic to potentially support other devices via different "adapters" in the future.

## 3. Frontend Implementation Plan

1.  **Device Abstraction (`useRfidReader` hook)**: A custom React hook will be created to manage the RFID reader's lifecycle.
    - `connect()`: Scans for and connects to the device using `navigator.bluetooth.requestDevice()`.
    - `disconnect()`: Disconnects from the device.
    - `scannedTags`: A state variable (array) holding the list of tags read since the last sync.
    - `status`: A state variable indicating the connection status (`disconnected`, `connecting`, `connected`, `error`).

2.  **Local Queue**: The `scannedTags` array in the `useRfidReader` hook will act as the local queue. This ensures that even if the user loses internet connectivity, the scanned data is not lost.

3.  **RFID Operations UI**: A dedicated UI section (e.g., `/rfid-operations`) will be created for field work. This UI will be optimized for mobile with large buttons for actions like:
    - **"Start Count"**: Connects to the reader and clears the local queue.
    - **"Sync Data"**: Sends the `scannedTags` queue to the backend.

4.  **Data Flow**:
    - User navigates to the "RFID Operations" page and selects an action (e.g., "Count Animals in Paddock X").
    - User clicks "Connect Reader". The `useRfidReader` hook initiates the Web Bluetooth connection.
    - As the user scans animals, the reader sends data to the browser. The hook captures this data and appends the RFID tags to the `scannedTags` array.
    - The UI updates in real-time, showing the count of scanned animals.
    - Once finished, the user clicks "Sync Data". The frontend makes a `POST` request to a backend endpoint (e.g., `/api/v1/rfid/sync/`) with the payload:
        ```json
        {
          "action": "count",
          "location_id": "uuid-of-paddock-x",
          "rfid_tags": ["tag1", "tag2", "tag3", ...]
        }
        ```

## 4. Backend Implementation Plan

1.  **API Endpoint (`/api/v1/rfid/sync/`)**: A new endpoint will be created to handle the incoming data from the frontend.
2.  **Asynchronous Processing**: Upon receiving a request, the endpoint will immediately return a `202 Accepted` response and trigger a background task using **Celery** and **Redis**. This prevents the user from waiting for a potentially long process and makes the UI feel fast.
3.  **Celery Task (`process_rfid_sync`)**: This background task will:
    - Iterate through the received `rfid_tags`.
    - For each tag, it will query the `Animal` model (`Animal.objects.get_or_create(rfid=tag, ...)`).
    - Based on the `action` in the payload (`count`, `movement`, etc.), it will perform the necessary business logic (e.g., create an `AnimalEvent`, update `animal.current_location`, generate a `MissingAlert` if an animal is not found).
    - It will create audit trail events.

## 5. Fallback Strategy for Non-Supported Browsers

Given that the Web Bluetooth API is not supported on all platforms (most notably iOS), a fallback is necessary for the product to be viable.

- **Recommended Fallback: Companion App**:
    - A simple, native mobile app (Android/iOS) can be developed in the future.
    - This app's sole purpose would be to connect to the RFID reader via the native Bluetooth API and sync the data to the same backend (`/api/v1/rfid/sync/`).
    - This approach aligns with the "no manual file imports" principle and offers the best long-term user experience.

- **Not Recommended (but possible): CSV Import**:
    - The prompt explicitly forbids this for the main workflow. If absolutely necessary as a stop-gap, we could allow users to use the manufacturer's app to export a CSV and then import it into our web app. This adds friction and should be avoided.

The MVP will proceed with the Web Bluetooth API approach, as it covers a significant portion of the target user base (Android users) and provides the most integrated experience. The architecture will be ready for the companion app to be added later.
