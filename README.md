# 🚀 SpaceEdu — Cinematic Solar System Explorer

SpaceEdu is a hackathon-winning full-stack application that combines a cinematic, animated UI with a live database of planets, moons, stars, and exoplanets.

## 🛠️ Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (No frameworks, pure performance)
- **Backend:** Node.js with Fastify
- **Database:** SQLite (via `better-sqlite3`)
- **Data Ingestion:** Custom Node.js Data Agent connecting to the NASA Exoplanet Archive

## ✨ Key Features
- **Cinematic Hero Section:** Pixel-perfect composition with dynamic video backgrounds, masked text entrance animations, and an interactive planet switcher.
- **Live Database Explorer:** A fully searchable grid pulling real-time data from our backend API.
- **One-Click NASA Sync:** The "Sync Live NASA Data" button hits a custom backend route that instantly inserts new exoplanets into the SQLite database and refreshes the UI.
- **Responsive:** Adapts beautifully from 4K monitors down to mobile phones.

## 🚀 How to Run Locally

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
  

### 🚀 Step 2: Zip the project
Now that your README is created, open PowerShell and run this to create your final submission zip:

```powershell
cd C:\projects\spaceEdu
Compress-Archive -Path frontend, backend, data, README.md -DestinationPath SpaceEdu_Submission.zip