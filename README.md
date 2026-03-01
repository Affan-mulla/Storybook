# 📖 StoryBook — Full Project Specification

> **Agent Reference Document** — Follow this spec precisely when scaffolding and building the StoryBook web application.

---

## 🏗️ Project Overview

**StoryBook** is a React web app where:
- An **admin** uploads stories (title, description, category, cover image, audio file)
- **Public users** can browse story cards (title, cover image, short description) without logging in
- **Authenticated users** can read full story text and listen to audio
- Media files (images + audio) are hosted on **Cloudinary**
- Story metadata is stored in **Firebase Firestore**
- Auth is handled by **Firebase Authentication**

---

## 📁 Folder Structure

```
storybook-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── StoryCard.jsx
│   │   ├── AudioPlayer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── AdminRoute.jsx
│   │   └── LoadingSkeleton.jsx
│   ├── pages/
│   │   ├── Home.jsx              # Browse all stories (public)
│   │   ├── StoryDetail.jsx       # Read/listen (auth required)
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       └── AddStory.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── firebase/
│   │   ├── config.js
│   │   ├── auth.js
│   │   └── firestore.js
│   ├── cloudinary/
│   │   └── upload.js             # Cloudinary unsigned upload helpers
│   ├── hooks/
│   │   └── useStories.js
│   ├── App.jsx
│   └── main.jsx
├── .env
└── tailwind.config.js
```

---

## 📦 Dependencies

```bash
# Scaffold project
npm create vite@latest storybook-app -- --template react
cd storybook-app

# Core dependencies
npm install firebase react-router-dom

# UI & UX
npm install react-hot-toast react-icons

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

> **Note:** No Cloudinary SDK is needed for unsigned uploads. Use the browser's native `fetch` API to POST to Cloudinary's REST endpoint directly.

---

## 🔐 Environment Variables (`.env`)

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=        # e.g. "my-cloud"
VITE_CLOUDINARY_UPLOAD_PRESET=     # Unsigned preset name, e.g. "storybook_unsigned"
```

> **Important:** All env vars must be prefixed with `VITE_` in Vite projects. Never expose signed Cloudinary API secrets in the frontend.

---

## ☁️ Cloudinary Setup

### 1. Create a Cloudinary Account
Sign up at [cloudinary.com](https://cloudinary.com) and note your **Cloud Name**.

### 2. Create an Unsigned Upload Preset
- Go to **Settings → Upload → Upload Presets**
- Click **Add upload preset**
- Set **Signing Mode** to `Unsigned`
- Set a preset name (e.g. `storybook_unsigned`)
- Under **Folder**, set a default folder like `storybook/`
- Save the preset name to `.env` as `VITE_CLOUDINARY_UPLOAD_PRESET`

### 3. Cloudinary Upload Helper (`src/cloudinary/upload.js`)

```js
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * @param {File} file - The file to upload (image or audio)
 * @param {string} folder - Cloudinary folder path (e.g. "storybook/images")
 * @param {string} resourceType - "image" | "video" | "raw" (use "video" for audio files)
 * @returns {Promise<string>} - The secure public URL of the uploaded file
 */
export async function uploadToCloudinary(file, folder = "storybook", resourceType = "image") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url; // Always use secure_url (HTTPS)
}
```

### 4. Resource Type Rules

| File Type | `resourceType` param |
|-----------|---------------------|
| JPEG, PNG, WebP images | `"image"` |
| MP3, WAV, OGG audio | `"video"` ← Cloudinary treats audio as "video" |
| PDF, TXT, other | `"raw"` |

### 5. Cloudinary Folder Structure

```
storybook/
├── images/          ← cover images  (resourceType: "image")
└── audio/           ← story audio   (resourceType: "video")
```

---

## 🔥 Firebase Setup

### Services to Enable

| Service | Purpose |
|---------|---------|
| **Authentication** | Email/Password login for users & admin |
| **Firestore** | Story metadata + user roles |

> Firebase Storage is **NOT used** — all media is on Cloudinary.

### Firestore Data Model

```
stories/
  {storyId}/
    title:          string        ← public
    description:    string        ← public (short teaser)
    category:       string        ← public
    coverImageURL:  string        ← public Cloudinary URL (thumbnail)
    fullContent:    string        ← shown only to authenticated users
    audioURL:       string        ← Cloudinary audio URL, shown only to authenticated users
    createdAt:      timestamp
    authorId:       string

users/
  {userId}/
    email:    string
    role:     "user" | "admin"
    createdAt: timestamp
```

### Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /stories/{storyId} {
      // Anyone can read story metadata
      allow read: if true;
      // Only authenticated admins can write
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

> **Note:** Field-level access control (hiding `fullContent` and `audioURL` from unauthenticated users) is enforced at the **component level** in `StoryDetail.jsx`. For production hardening, move content delivery to a Firebase Cloud Function.

### Firebase Config (`src/firebase/config.js`)

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

## 🔐 Authentication Flow

```
User visits site
    ↓
Browses story cards (title, cover, short description) ✅ — no login required
    ↓
Clicks "Read Story" or "Listen Now"
    ↓
Not logged in? → Redirect to /login (store intended URL in location.state)
    ↓
After login/register → redirect back to the story
    ↓
Logged in → Full story text + AudioPlayer unlocked ✅
```

### AuthContext (`src/context/AuthContext.jsx`)

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        setRole(snap.exists() ? snap.data().role : "user");
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 🧩 Component Breakdown

### `ProtectedRoute.jsx`
Redirects to `/login` if user is not authenticated, preserving the intended URL in `location.state`.

```jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
```

### `AdminRoute.jsx`
Checks `role === "admin"` from Firestore before allowing access.

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, role } = useAuth();
  if (!user || role !== "admin") return <Navigate to="/" replace />;
  return children;
}
```

### `AudioPlayer.jsx`
Custom HTML5 audio player with Tailwind-styled controls.

```jsx
import { useRef, useState } from "react";

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (playing) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    const { currentTime, duration } = audioRef.current;
    setProgress((currentTime / duration) * 100 || 0);
  };

  const handleSeek = (e) => {
    const val = e.target.value;
    audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    setProgress(val);
  };

  return (
    <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <button onClick={togglePlay} className="text-2xl text-amber-700 hover:text-amber-900">
        {playing ? "⏸" : "▶️"}
      </button>
      <input type="range" min="0" max="100" value={progress}
        onChange={handleSeek} className="flex-1 accent-amber-700" />
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => setPlaying(false)} />
    </div>
  );
}
```

### `StoryCard.jsx`
Displays public story metadata. "Read More" button triggers auth check.

### `Navbar.jsx`
Shows logo, nav links, and Login/Logout button based on auth state.

### `LoadingSkeleton.jsx`
Animated placeholder cards shown while Firestore data loads.

---

## 📄 Page Breakdown

### `Home.jsx` (Public)
- Fetch all stories from Firestore (`getDocs` on `stories` collection)
- Render a responsive grid of `StoryCard` components
- Provide search input and category filter buttons
- Show `LoadingSkeleton` while fetching

### `StoryDetail.jsx` (Auth Required via `ProtectedRoute`)
- Fetch single story by ID from Firestore
- If logged in → render full text content + `AudioPlayer` with `audioURL`
- The `ProtectedRoute` wrapper redirects unauthenticated users to `/login` before this page renders

### `Login.jsx`
- Firebase `signInWithEmailAndPassword`
- On success → redirect to `location.state.from` (the story they tried to access) or `/`
- Show toast on error

### `Register.jsx`
- Firebase `createUserWithEmailAndPassword`
- After registration → write `{ email, role: "user", createdAt }` to `users/{uid}` in Firestore
- Redirect to home or intended page

### `AdminDashboard.jsx`
- List all stories with title, category, cover thumbnail
- Delete button (removes Firestore doc; Cloudinary asset cleanup is optional/manual)
- Link to `/admin/add`

### `AddStory.jsx`
Complete admin form with Cloudinary upload:

```jsx
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { uploadToCloudinary } from "../../cloudinary/upload";

export default function AddStory() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", category: "", fullContent: "" });
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverFile || !audioFile) return alert("Please select both image and audio files.");
    setUploading(true);

    try {
      // Upload cover image to Cloudinary
      const coverImageURL = await uploadToCloudinary(coverFile, "storybook/images", "image");

      // Upload audio to Cloudinary (resourceType "video" handles audio)
      const audioURL = await uploadToCloudinary(audioFile, "storybook/audio", "video");

      // Save story metadata to Firestore
      await addDoc(collection(db, "stories"), {
        ...form,
        coverImageURL,
        audioURL,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });

      alert("Story published!");
      setForm({ title: "", description: "", category: "", fullContent: "" });
      setCoverFile(null);
      setAudioFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold font-playfair">Add New Story</h1>
      <input placeholder="Title" value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        className="w-full border rounded p-2" required />
      <input placeholder="Short Description (public teaser)" value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        className="w-full border rounded p-2" required />
      <input placeholder="Category" value={form.category}
        onChange={e => setForm({ ...form, category: e.target.value })}
        className="w-full border rounded p-2" required />
      <textarea placeholder="Full Story Content (auth-gated)" value={form.fullContent}
        onChange={e => setForm({ ...form, fullContent: e.target.value })}
        className="w-full border rounded p-2 h-40" required />
      <div>
        <label className="block text-sm font-medium mb-1">Cover Image (JPEG/PNG)</label>
        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Audio File (MP3/WAV)</label>
        <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} required />
      </div>
      <button type="submit" disabled={uploading}
        className="bg-amber-700 text-white px-6 py-2 rounded hover:bg-amber-800 disabled:opacity-50">
        {uploading ? "Uploading..." : "Publish Story"}
      </button>
    </form>
  );
}
```

---

## 🛣️ Routing (`App.jsx`)

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import StoryDetail from "./pages/StoryDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddStory from "./pages/admin/AddStory";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/story/:id"   element={<ProtectedRoute><StoryDetail /></ProtectedRoute>} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/admin"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/add"   element={<AdminRoute><AddStory /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 🎨 UI/UX Design

**Theme:** Warm, cozy, storybook-inspired — aged parchment tones, deep forest greens and use index.css theme for this.

**Typography (Google Fonts):**
- `Playfair Display` — headings
- `Lora` — body text

Add to `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```
```

**Key UX Patterns:**
- Smooth fade-in animations on story cards (`animate-fade-in`)
- `LoadingSkeleton` pulse animation while Firestore data loads
- Toast notifications via `react-hot-toast` for login success/errors/upload status
- Responsive grid: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
- `<Toaster />` placed in `App.jsx` root

---

## 📊 Data Flow Summary

```
Admin fills AddStory form
    ↓
File selected → uploadToCloudinary(file, folder, resourceType)
    ↓
POST to https://api.cloudinary.com/v1_1/{cloud_name}/{type}/upload
    ↓
Returns secure_url (HTTPS Cloudinary CDN link)
    ↓
Both URLs + text metadata → addDoc() to Firestore "stories" collection
    ↓
─────────────────────────────────────────────
Public user visits Home.jsx
    ↓
getDocs("stories") → renders StoryCard grid
StoryCard shows: title, description, category, coverImageURL (Cloudinary)
    ↓
Clicks "Read Story" → ProtectedRoute checks auth
    ↓
Authenticated → StoryDetail.jsx renders fullContent + AudioPlayer(audioURL)
Not authenticated → Redirect to /login → redirect back after login
```

---

## 🚀 Development Phases

**Phase 1 — Setup (Day 1)**
- Init Vite + React project
- Configure Tailwind CSS with custom theme (fonts, colors)
- Create Firebase project, enable Auth + Firestore
- Set up Cloudinary account and unsigned upload preset
- Fill in `.env` with all keys

**Phase 2 — Auth System (Day 2)**
- `AuthContext.jsx` with `onAuthStateChanged` + Firestore role fetch
- `Login.jsx` and `Register.jsx` pages
- `ProtectedRoute.jsx` and `AdminRoute.jsx`
- Write user doc to Firestore on registration

**Phase 3 — Cloudinary Integration (Day 3)**
- Write `src/cloudinary/upload.js` helper
- Test image upload and audio upload manually in a test component
- Confirm `secure_url` is returned and accessible

**Phase 4 — Story Browsing (Day 4)**
- `useStories.js` custom hook for Firestore fetching
- `StoryCard.jsx` component
- `Home.jsx` with grid, search, category filter, loading skeletons

**Phase 5 — Story Detail + Audio (Day 5)**
- `StoryDetail.jsx` with full content rendering
- `AudioPlayer.jsx` custom component
- Auth-gate enforced via `ProtectedRoute`

**Phase 6 — Admin Panel (Day 6)**
- `AddStory.jsx` with Cloudinary upload + Firestore save
- `AdminDashboard.jsx` with story list and delete
- Upload progress indicator for large audio files

**Phase 7 — Polish & Deploy (Day 7)**
- Loading states, error boundaries, toast notifications
- Mobile responsiveness audit
- Deploy to Vercel or Firebase Hosting

---

## ⚡ Key Implementation Notes

- **Cloudinary audio uploads:** Use `resourceType: "video"` — Cloudinary classifies audio under the video resource type. Using `"raw"` works too but loses audio transformation features.
- **Upload progress:** For large audio files, consider using `XMLHttpRequest` instead of `fetch` to track `upload.onprogress`.
- **Auth persistence:** `onAuthStateChanged` in `AuthContext` keeps auth state across refreshes automatically.
- **Redirect after login:** Store intended URL in `location.state.from` before redirecting to `/login`, then read it in `Login.jsx` to redirect back after success.
- **Admin role setup:** After creating the first admin user via Register, manually set `role: "admin"` in Firestore console for that user's document.
- **Cloudinary free tier limits:** 25 GB storage, 25 GB bandwidth/month — sufficient for development and small-scale production.
- **Delete stories:** Firestore doc deletion is straightforward. Cloudinary asset deletion from the frontend requires a signed request (not safe to expose API secret). For cleanup, delete assets manually from the Cloudinary dashboard or via a backend/Cloud Function.
- **Environment variables:** Never commit `.env` to version control. Add `.env` to `.gitignore`.

---

## 🔒 Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] Cloudinary upload preset is **unsigned** (no API secret in frontend)
- [ ] Firestore rules prevent non-admin writes to `stories` collection
- [ ] `fullContent` and `audioURL` fields are rendered only inside `ProtectedRoute`-wrapped pages
- [ ] Admin route is protected by both auth check and role check
- [ ] No Firebase Storage rules needed (Firebase Storage is not used)#   S t o r y b o o k  
 