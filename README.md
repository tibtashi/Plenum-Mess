# CraveBox - School Mess App

This project is set up with React, Vite, Tailwind CSS, and Firebase.

## Setup Instructions

### 1. Install Node.js
Go to [nodejs.org](https://nodejs.org/) and download the **LTS** version. Install it on your computer.

### 2. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the steps to create one.
3. Once created, click the **Web icon (</>)** to register a web app.
4. Give it a nickname (e.g., "Mess App").
5. Copy the `firebaseConfig` object. It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
6. Open the `.env` file in this folder and replace the placeholders with your actual values.

### 3. Enable Firebase Services
In the Firebase Console:
- **Authentication**: Go to "Build" -> "Authentication" -> "Get Started". Enable the **Anonymous** sign-in provider in the "Sign-in method" tab.
- **Firestore Database**: Go to "Build" -> "Firestore Database" -> "Create database".
    - Start in **Test Mode** (so you can read/write during development).
    - Choose a location near you.

### 4. Run the App
Once Node.js is installed, open your terminal (PowerShell or Command Prompt) in this folder and run:
```bash
npm install
npm run dev
```
The terminal will give you a link (usually `http://localhost:5173`). Open it in your browser!

## AI Features
The app uses the **Gemini API** for gourmet meal suggestions. Your API key is already configured in the `.env` file.
