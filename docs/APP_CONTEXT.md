# Plenum Mess App Context

Last updated: 2026-05-16

## Product Summary

Plenum Mess, currently branded in the UI as CraveBox, is a campus mess voting and kitchen planning prototype. It supports three roles:

- Student: enters the student portal, votes on published dishes, sees rankings, and posts on the social food wall.
- Chef: enters stock, gets dish suggestions from available raw material, publishes dishes for meal sessions, and checks voting results.
- Admin: monitors overall participation, low-stock alerts, daily engagement, and the student social feed.

The app is a React + Vite single page application with Tailwind CSS, Framer Motion, Lucide icons, Firebase Auth, and Firestore.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Firebase Auth
- Cloud Firestore
- Framer Motion
- Lucide React

Main files:

- `src/App.jsx`: main app state, role flows, pantry logic, voting, publishing, admin views, and UI components.
- `src/firebase.js`: Firebase initialization from Vite environment variables.
- `src/index.css`: global Tailwind styles and app visual system.
- `firestore.rules`: development Firestore rules.
- `.env`: local environment variables only. Do not commit this file.

## Firebase Project

Current local `.env` points to Firebase project `mess-app-37e60`.

Required Vite environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GEMINI_API_KEY`

Firebase Auth setup:

- Google provider must be enabled.
- Authorized domains must include `localhost`, `127.0.0.1`, and the deployed Vercel domain.
- The app uses Google redirect sign-in for the optional student mail login.

Firestore collections currently used:

- `artifacts/mess-voting-app-v5/public/data/inventory`
- `artifacts/mess-voting-app-v5/public/data/registered_students_v2`

Most prototype-only voting/menu/social state still uses browser localStorage.

## Role Flows

### Student

Student entry keeps the name input as the primary flow. The optional Google mail button is secondary and saves the authenticated student email when Firebase Auth succeeds.

Student voting now supports multi-vote per meal session:

- A student can vote for more than one dish in the same meal session.
- Tapping a selected dish again removes only that dish vote.
- Vote state is stored as a list of dish ids per student per session.
- Old single-vote localStorage data is converted safely into a one-item list.

Student social posts appear on the student graffiti wall and are also visible to admin in the Social tab.

### Chef

Chef PIN is `1111`.

Chef features:

- Raw material search supports English aliases and Hindi text.
- Quick picks are shown by default, with a larger pantry catalog available through search.
- Raw materials are submitted as a batch.
- Current stock list appears above dish suggestions.
- Dish suggestions update from projected/current stock.
- Chef can select 1 to 6 dishes and publish them for a specific meal session.
- Publish flow shows a confirmation modal with English and Hindi/Hinglish copy before publishing.
- Chef Results is split into Breakfast, Lunch, and Dinner sections.

Meal sessions:

- Breakfast
- Lunch
- Dinner

Published menus are stored separately by session.

### Admin

Admin PIN is `0000`.

Admin features:

- Overall registered student count.
- Overall student-voted count across all meal sessions.
- Overall not-voted count.
- Daily participation chart.
- Critical stock alerts.
- Student Social Feed tab with the same graffiti wall styling as the student wall, plus readable comments.
- Student Login Registry clear action for starting fresh with app-level student records.

Admin no longer switches between breakfast/lunch/dinner because the intended admin view is overall status.

## Inventory And Alerts

Current stock starts empty so the chef can fill it manually.

Low-stock alerts use a fixed baseline:

- `LOW_STOCK_MINIMUM_PAR_LEVEL = 10`
- An item is low stock when quantity is at or below the effective par level.

Firestore inventory sync is attempted first. If Firestore is unavailable, the prototype falls back to local inventory state.

## Recent Change Log

- Added Firebase configuration guards so the deployed app still renders when Vercel environment variables are missing.
- Added clearer Google login messaging when Firebase is not configured in deployment.
- Expanded pantry material search with many common raw materials.
- Removed visible zone/cold-room labels from stock cards where they were not useful to the user.
- Moved Current Stock List above Suggested Dishes.
- Made Suggested Dishes react to entered stock.
- Added Breakfast/Lunch/Dinner meal session publishing.
- Added bilingual publish confirmation modal.
- Added session-separated student voting and chef result sections.
- Changed student voting from single-choice to multi-vote with tap-again removal.
- Added Firebase Google sign-in as an optional student login path.
- Restored name input as the primary student entry path.
- Added Firestore student registry collection `registered_students_v2`.
- Changed admin participation to overall totals instead of per-session checking.
- Added Admin Social tab for student wall posts.
- Removed the extra "or login with mail" divider and made Google login a cleaner secondary button.

## Current Prototype Limitations

- Chef/admin PINs are hardcoded in the frontend.
- Most voting/menu/social data is still localStorage, so it is browser-local.
- Firestore rules are open for development and must be tightened before real deployment.
- Firebase Auth accounts cannot be deleted from the frontend; the app can only clear its student registry collection.
- Vercel deployment needs environment variables added in the Vercel project settings.
- Without Vercel environment variables, Firebase-backed features are disabled but the app should still render using local prototype data.

## Development Commands

```bash
npm install
npm run dev
npm run build
```

Local app URL:

```text
http://127.0.0.1:5173/index.html
```

Production build output:

```text
dist
```
