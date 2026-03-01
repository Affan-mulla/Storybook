# StoryBook

## How to Run the Project

### 1) Prerequisites
- Node.js 18+ (recommended)
- npm

### 2) Install dependencies
```bash
npm install
```

### 3) Configure environment variables
Create a `.env` file in the project root and add:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

### 4) Start development server
```bash
npm run dev
```

### 5) Open in browser
Use the local URL shown in terminal (usually `http://localhost:5173`).

## Optional Commands

### Lint
```bash
npm run lint
```

### Production build
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```
