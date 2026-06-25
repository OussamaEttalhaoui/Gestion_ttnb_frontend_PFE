# 🛰️ Intelligent Framework for Undeveloped Land Tax Management (TTNB)

## 📌 Overview

# 🛰️ TTNB Management System — Intelligent Framework for Undeveloped Land Tax Management

## 📌 Overview

This project is a **full-stack geospatial decision-support application** for the management and automation of the **Tax on Undeveloped Land (TTNB)**.

It combines:
- Satellite imagery (VIIRS nighttime lights)
- Geospatial APIs (Google Places, OpenStreetMap)
- Modern web technologies (React + Spring Boot)
- Intelligent classification algorithms

The system supports both **tax administration workflows** and **automated territorial analysis** for urban planning and fiscal decision-making.

---

## ⚠️ Repository Scope

This repository contains **only the FRONTEND application (React.js)**.

The backend services are **private due to project confidentiality**:
- 🔒 Spring Boot backend (business logic, security, PDF, tax engine)
- 🔒 Python FastAPI microservice (geospatial classification engine)

The frontend interacts with these services through secured REST APIs.

---

## 🎯 Key Features

- 💳 Tax lifecycle management interface
- 🧾 Census, debts, exemptions, and declarations management
- 👥 Role-based user administration (Admin / User)
- 🔔 Real-time notifications (WebSocket integration)
- 🗺️ Interactive GIS dashboard (Google Maps integration)
- 🛰️ AI-based land classification (Green / Orange / Red zones)
- 📍 Infrastructure visualization (schools, hospitals, roads, etc.)
- 📄 Automated PDF generation (via backend APIs)


---

## 🏗️ System Architecture

- **Frontend (this repo):** React.js + Map visualization + UI/UX layer  
- **Backend (private):** Spring Boot (JWT, business logic, tax system, PDF generation)  
- **Microservice (private):** FastAPI Python (geospatial + satellite classification)

---

## 🧠 Core Modules (Application Functionalities)

### 📊 Census Management
Manages taxpayers (individuals or organizations) and their land properties.  
Supports property registration, updates, and deletion with full classification of land types (registered, in progress, unregistered).

---

### 💰 Tax Debt Management
Automatic computation of TTNB based on surface, zone type, penalties, and legal rules.  
Generates payment slips (BV) and detailed PDF tax summaries per fiscal year.

---

### 📄 Declaration Module
Generates official declaration PDFs (ownership or mutation).  
Data is auto-filled based on property ID and stored records.

---

### ⚖️ Tax Regulation Module
Allows searching, updating, and settling tax debts.  
Supports filtering by taxpayer, property, or fiscal year with full payment tracking.

---

### 🧾 Tax Rate Configuration (Admin Only)
Defines and manages taxation rates by zone type (urban, villa, rural, etc.).  
Ensures consistency of automatic tax computation rules.

---

### 👥 User Management (Admin Only)
Full CRUD management of system users with roles and permissions (Create, Read, Update, Delete).  
Ensures secure access control and auditability across the platform.

---

### 🏛️ Exemption Management
Handles temporary tax exemptions based on land conditions (unserviceable land, construction bans, agricultural zones, etc.).  
Includes automated expiration detection and real-time notifications via WebSocket.

---

### 🛰️ Land Classification Module (External Service)
This module evaluates the level of urban development of a geographic area using its Lambert coordinates (X, Y) and a configurable analysis radius.  
It relies on a FastAPI microservice combining Google Places, OpenStreetMap, and NOAA VIIRS satellite data to extract infrastructures, physical networks, and nightlight intensity.  
The system then applies a rule-based decision model to classify the area into three zones (highly, moderately, or poorly equipped) returned as structured JSON to the backend.


---

## 🛠️ Tech Stack

### Backend
- Spring Boot
- Spring Security (JWT)
- MySQL
- Swagger / OpenAPI
- iText (PDF generation)

### Geospatial Microservice
- FastAPI (Python)
- GeoPy / PyProj
- Google Places API
- OpenStreetMap Overpass API
- Google Earth Engine (VIIRS)
- Axios (API communication) & WebSocket (real-time notifications)

### Frontend
- React.js
- Tailwind CSS
- Material UI
- @react-google-maps/api

### Tools
- Postman
- Git / GitHub

---

## 🖥️ Screenshots

### 🔐 Login Page
<img width="966" height="464" alt="login" src="https://github.com/user-attachments/assets/5e3f93e8-a999-4b2b-8d55-abb5448c548b" />


### 🏠 Home Dashboard
<img width="966" height="462" alt="home" src="https://github.com/user-attachments/assets/4e392e69-b1a3-489f-ad5c-e6d586b53bf6" />


### 🧾 Census Management
<img width="966" height="472" alt="recensement" src="https://github.com/user-attachments/assets/ac173465-cf90-4e74-94eb-4af5c61081a5" />
<img width="966" height="470" alt="form_redevable" src="https://github.com/user-attachments/assets/1c048539-6ab6-468e-ad35-cf891cd9cca0" />


### 💰 Debt Management
<img width="966" height="472" alt="creance" src="https://github.com/user-attachments/assets/af051244-006d-40f8-a9b9-2b6678b2ff36" />
<img width="966" height="472" alt="form_creance" src="https://github.com/user-attachments/assets/fcd98fa2-5db6-4af3-9038-ea90c4edec7c" />
<img width="966" height="470" alt="calcul" src="https://github.com/user-attachments/assets/4e95821d-8f10-43d8-8e18-ec36d3b218ca" />
<img width="945" height="1322" alt="bulletin" src="https://github.com/user-attachments/assets/42e27a49-23c6-40d6-b219-2345515760c6" />


### 📄 Exemptions Management Interface
<img width="966" height="474" alt="exoneration" src="https://github.com/user-attachments/assets/b2fa6058-be40-4460-bc8b-bfa55a7e211b" />
<img width="902" height="1260" alt="attestation" src="https://github.com/user-attachments/assets/38b6a9d0-e809-440b-b397-010d8c484c53" />
<img width="966" height="466" alt="notif" src="https://github.com/user-attachments/assets/97bb4f10-7b01-48f6-918c-f7e4e825d9e9" />

### 📄 Tax Situation Regulation
<img width="966" height="472" alt="reglement" src="https://github.com/user-attachments/assets/c7755b8b-e438-4b25-aca9-f6dfc55c8585" />
<img width="966" height="466" alt="list_creances" src="https://github.com/user-attachments/assets/a488c412-93a3-4d4c-84b7-15ce746eefa9" />
<img width="966" height="474" alt="details_creance" src="https://github.com/user-attachments/assets/f214176f-eaa3-448e-86e7-60be77f78dab" />
<img width="966" height="474" alt="options_reglement" src="https://github.com/user-attachments/assets/f98d4029-077c-4125-a7a3-6a7e457914a7" />
<img width="985" height="702" alt="creance_soldee" src="https://github.com/user-attachments/assets/d7669563-6408-4aca-bc76-0ff9cb4bc37f" />




### 🧭 Land Classification Interface
<img width="1440" height="675" alt="zone_popup" src="https://github.com/user-attachments/assets/d8574a01-a90d-4219-8119-2420823f13fa" />
<img width="1440" height="684" alt="classification" src="https://github.com/user-attachments/assets/f9f20648-26c2-4e60-a543-3faff74e97d7" />
<img width="1440" height="682" alt="resultats_classification" src="https://github.com/user-attachments/assets/d8d4907d-b37a-473a-ad62-c5bd32a9f4ce" />
<img width="1440" height="681" alt="list_infrastructures" src="https://github.com/user-attachments/assets/1da03757-a817-4585-b765-e56f457a157a" />
<img width="1440" height="681" alt="classification_douar" src="https://github.com/user-attachments/assets/f1913f40-18cf-497c-b9ad-3cfacee96e5a" />

### 🗺️ Interactive Map View
<img width="1440" height="900" alt="map_plan" src="https://github.com/user-attachments/assets/02d4541f-4497-4e89-9f7b-d0bb89e28f90" />

### 👥 User Management (Admin)
<img width="966" height="474" alt="users" src="https://github.com/user-attachments/assets/649cd9f2-faf2-46b6-93fe-e01d2403c668" />
<img width="966" height="474" alt="add_user_form" src="https://github.com/user-attachments/assets/7cd7cc9e-e38f-4a74-8078-1d4ea981005e" />

---

## ⚙️ How It Works

1. User selects a geographic area (point or polygon)
2. System collects geospatial data (POI + infrastructure + satellite)
3. FastAPI microservice processes classification
4. Spring Boot backend stores results and applies tax rules
5. React frontend displays results on interactive map
6. Reports and PDFs are generated automatically

---

## 📊 Results

- Automated classification of territories
- Improved detection of undeveloped land
- Faster tax decision-making
- Centralized municipal data system
- Enhanced transparency and traceability

---

