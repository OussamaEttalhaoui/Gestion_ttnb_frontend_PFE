# 🛰️ Intelligent Framework for Undeveloped Land Tax Management (TTNB)

## 📌 Overview

This project is an **intelligent geospatial decision-support system** for the management of the **Tax on Undeveloped Land (TTNB)**.

It combines:
- Satellite imagery (nighttime lights)
- Geospatial APIs (Google Places, OpenStreetMap)
- Web technologies
- Machine learning-inspired decision rules

The system automates:
- Land classification (urban development level)
- Tax lifecycle management
- Administrative operations (declarations, exemptions, payments)
- Interactive geospatial visualization

---

## 🎯 Key Features

- 🗺️ Automatic classification of land (Green / Orange / Red zones)
- 🛰️ Satellite-based urbanization analysis (VIIRS Night Lights)
- 📍 POI extraction (schools, hospitals, transport, etc.)
- 🧠 Semantic classification of infrastructures
- 📄 Automated tax calculation and PDF generation
- 💳 Debt and payment management
- 🏛️ Exemption handling with notifications
- 👥 User and role management (Admin / Agent)
- 🧭 Interactive map-based interface

---

## 🏗️ System Architecture

The system follows a **microservices architecture**:

### 1. Geospatial Microservice (FastAPI - Python)
- Land classification engine
- Integration of:
  - Google Places API
  - OpenStreetMap (Overpass API)
  - NOAA VIIRS Nighttime Lights
- Geospatial computation (radius, polygons, projections)

### 2. Backend Core (Spring Boot - Java)
- Business logic (TTNB lifecycle)
- Authentication & security (JWT)
- Tax calculation engine
- PDF generation (receipts, certificates)
- REST API integration with microservice

### 3. Frontend (React.js)
- Interactive GIS dashboard
- Google Maps integration (@react-google-maps/api)
- Visualization of:
  - Classified zones
  - Infrastructures
  - Statistical tables

---

## 🧠 Land Classification Logic

Each area is analyzed using multiple data sources:

### 📡 Data Sources
- Google Places API → Schools, hospitals, transport
- OpenStreetMap → Roads, water, electricity
- VIIRS Nighttime Lights → Urban intensity

### ⚙️ Processing Steps
1. Define area (coordinates or polygon)
2. Convert projection (Lambert → WGS84)
3. Extract POIs within radius
4. Detect infrastructure types (semantic + keyword matching)
5. Compute density indicators
6. Evaluate nightlight intensity
7. Apply decision model

### 🏷️ Final Output
- 🟢 Well-equipped area
- 🟠 Moderately equipped area
- 🔴 Poorly equipped area

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


### 📄 Declaration & PDF Generation
<img width="1035" height="514" alt="declaration" src="https://github.com/user-attachments/assets/92778f5e-ba5e-4d8e-97b8-7392727e0311" />
<img width="922" height="1287" alt="declaration_pdf" src="https://github.com/user-attachments/assets/376f685f-d580-4fe4-a8e2-7cafa50700da" />

### 📄 Tax Situation Regulation
<img width="966" height="472" alt="reglement" src="https://github.com/user-attachments/assets/c7755b8b-e438-4b25-aca9-f6dfc55c8585" />
<img width="966" height="466" alt="list_creances" src="https://github.com/user-attachments/assets/a488c412-93a3-4d4c-84b7-15ce746eefa9" />
<img width="966" height="474" alt="details_creance" src="https://github.com/user-attachments/assets/f214176f-eaa3-448e-86e7-60be77f78dab" />
<img width="966" height="474" alt="options_reglement" src="https://github.com/user-attachments/assets/f98d4029-077c-4125-a7a3-6a7e457914a7" />
<img width="985" height="702" alt="creance_soldee" src="https://github.com/user-attachments/assets/d7669563-6408-4aca-bc76-0ff9cb4bc37f" />




### 🧭 Land Classification Interface
![Classification](screenshots/classification.png)

### 🗺️ Interactive Map View
![Map](screenshots/map.png)

### 👥 User Management (Admin)
![Users](screenshots/users.png)

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

