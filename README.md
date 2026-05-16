# QuickWork

A trust-based local service marketplace platform connecting clients with skilled providers.

## 🚀 Features# QuickWork

![Project Status](https://img.shields.io/badge/Status-Under%20Development-blue)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1A9E77?style=for-the-badge&logo=leaflet&logoColor=white)
![Author](https://img.shields.io/badge/Author-Ismail%20KT-blue)

## Overview

QuickWork is a robust, trust-based local service marketplace platform designed to seamlessly connect clients with skilled service providers. It facilitates efficient job discovery, management, and execution within a localized context, leveraging advanced geo-spatial technologies and real-time communication. The platform supports role-based authentication for Users, Providers, and Administrators, features a real-world job location system with Geo-based data, and includes a real-time chat system for direct communication. Structured job creation, management, and a developing trust & reputation system are core components.

A live demonstration of the platform is available at: 👉 [https://quickwork-mu.vercel.app](https://quickwork-mu.vercel.app)

## System Architecture

The QuickWork project is structured into distinct `frontend` and `backend` services, fostering a clear separation of concerns and enabling independent development and deployment.

*   **Backend (`/backend`)**:
    *   Developed with **Node.js** and **Express.js**, providing a RESTful API for all platform functionalities.
    *   Utilizes **MongoDB** for data persistence, including GeoJSON-based storage for location data (`[lng, lat]`).
    *   Integrates **Socket.IO** to power the real-time chat system, enabling instant communication between users.
    *   Implements centralized HTTP status handling using enums for consistent API responses.
    *   Employs clean DTO-based API responses for structured data exchange.
    *   Handles authentication, user/provider/admin role management, job creation/management, and location-based queries.
    *   Features location autocomplete functionality, likely integrating with external geocoding APIs.

*   **Frontend (`/frontend`)**:
    *   Built with **React** and **TypeScript**, providing a dynamic and type-safe user interface.
    *   Consumes APIs exposed by the backend service.
    *   Integrates **Leaflet** for interactive map views, displaying job locations and provider proximity.
    *   Manages user authentication flows, job browsing, application processes, and real-time chat interactions.
    *   Provides distinct user experiences tailored to Client, Provider, and Admin roles.

The frontend communicates with the backend via standard HTTP requests for data retrieval and manipulation, and through WebSocket connections (Socket.IO) for real-time features such as chat and potential live updates on job statuses or locations.

## Prerequisites

Before setting up and running QuickWork, ensure the following software is installed on your system:

*   **Node.js**: Version 14.x or higher (LTS recommended).
    *   [Download Node.js](https://nodejs.org/)
*   **npm** or **Yarn**: Package manager for Node.js. npm is typically bundled with Node.js.
    *   [Download Yarn](https://yarnpkg.com/getting-started/install)
*   **MongoDB**: A running instance of MongoDB (local or cloud-hosted like MongoDB Atlas).
    *   [Install MongoDB Community Server](https://docs.mongodb.com/manual/installation/)

## Installation

Follow these steps to set up the QuickWork project locally:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ismailkt313/quickwork.git
    cd quickwork
    ```

2.  **Backend Setup:**

    Navigate to the `backend` directory, install dependencies, and configure environment variables.

    ```bash
    cd backend
    npm install
    ```

    Create a `.env` file in the `backend` directory with the following variables:

    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/quickwork_db
    JWT_SECRET=your_jwt_secret_key
    GEOCODING_API_KEY=your_geocoding_api_key # e.g., for Mapbox, Google Maps, etc.
    ```

3.  **Frontend Setup:**

    Navigate to the `frontend` directory, install dependencies, and configure environment variables.

    ```bash
    cd ../frontend
    npm install
    ```

    Create a `.env` file in the `frontend` directory with the following variables:

    ```env
    REACT_APP_API_BASE_URL=http://localhost:5000/api
    REACT_APP_SOCKET_URL=http://localhost:5000
    REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token # Or similar for Leaflet tile provider
    ```

## Usage

To run the QuickWork application locally, follow these instructions:

1.  **Start the Backend Server:**

    From the `backend` directory, execute the start command.

    ```bash
    cd backend
    npm run dev # Or 'npm start' if a production build is configured
    ```

    The backend server will typically start on `http://localhost:5000`.

2.  **Start the Frontend Application:**

    From the `frontend` directory, execute the start command.

    ```bash
    cd ../frontend
    npm run dev # Or 'npm start'
    ```

    The frontend application will typically open in your browser at `http://localhost:3000` (or another available port).

You can now interact with the QuickWork platform through your web browser.

<br/><br/>_Generated by [Auto-README](https://auto-readme-livid.vercel.app/)_

* 🔐 Role-based authentication (User / Provider / Admin)
* 📍 Real-world job location system with Geo-based data
* 🗺️ Job location map view for providers
* 💬 Real-time chat system (Socket.IO)
* 📦 Structured job creation and management
* ⭐ Trust & reputation-based system (in progress)

## 🧠 Key Implementations

* GeoJSON-based location storage (`[lng, lat]`)
* Location autocomplete using external APIs
* Map integration using Leaflet
* Centralized HTTP status handling with enums
* Clean DTO-based API responses

## 🛠 Tech Stack

* Frontend: React, TypeScript
* Backend: Node.js, Express, MongoDB
* Realtime: Socket.IO
* Maps: Leaflet + OpenStreetMap

## 🌐 Live Demo

👉 https://quickwork-mu.vercel.app

## 📌 Project Status

Actively under development. Core features implemented, with focus on scalability and real-world usage.

---

## 👨‍💻 Author

Ismail KT
