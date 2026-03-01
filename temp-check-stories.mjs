import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKULxaxZwhgxzspIbV8lv87I5seExCsoY",
  authDomain: "story-book-5331c.firebaseapp.com",
  projectId: "story-book-5331c",
  storageBucket: "story-book-5331c.firebasestorage.app",
  messagingSenderId: "965527189075",
  appId: "1:965527189075:web:1d39c0af9f25435657b8a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

try {
  const snap = await getDocs(query(collection(db, "stories"), limit(20)));
  console.log(`STORY_COUNT=${snap.size}`);
  snap.forEach((doc) => {
    const data = doc.data();
    console.log(`STORY_ID=${doc.id}; TITLE=${data.title ?? ""}; CATEGORY=${data.category ?? ""}`);
  });
} catch (error) {
  console.log(`FIRESTORE_ERROR=${error.message}`);
}
