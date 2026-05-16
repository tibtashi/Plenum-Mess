import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_L1uzgedRqb8owTuTmG8zHgVrSUh_Fj4",
  authDomain: "mess-app-37e60.firebaseapp.com",
  projectId: "mess-app-37e60",
  storageBucket: "mess-app-37e60.firebasestorage.app",
  messagingSenderId: "1073820612056",
  appId: "1:1073820612056:web:65863c0a1f11462057d383"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appId = 'mess-voting-app-v3';

async function seed() {
  console.log("🗳️ Casting Random Votes for the Leaderboard...");
  const batch = writeBatch(db);
  const voteRef = collection(db, 'artifacts', appId, 'public', 'data', 'votes');
  
  const mealIds = ['m1', 'm2', 'm3'];
  const names = ['Rahul', 'Ananya', 'Kevin', 'Sara', 'Vikram', 'Zoe', 'Ahmed', 'Priya', 'Leo', 'Maya'];

  // Add 25 random votes
  for (let i = 0; i < 25; i++) {
    const randomMeal = mealIds[Math.floor(Math.random() * mealIds.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newDoc = doc(voteRef);
    batch.set(newDoc, {
      mealId: randomMeal,
      studentName: randomName,
      userId: 'sim-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    });
  }

  await batch.commit();
  console.log("✅ 25 Votes Cast! Check the Stats tab now.");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
