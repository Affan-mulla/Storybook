import { useCallback, useEffect, useState } from "react";
import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";

export default function useLikes(storyId) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loadedForStoryId, setLoadedForStoryId] = useState(null);
  const [busy, setBusy] = useState(false);

  const loading = Boolean(storyId) && loadedForStoryId !== storyId;

  useEffect(() => {
    if (!storyId) {
      return;
    }

    const storyRef = doc(db, "stories", storyId);
    const unsubStory = onSnapshot(storyRef, (snapshot) => {
      const data = snapshot.data();
      setLikesCount(Number(data?.likesCount || 0));
      setLoadedForStoryId(storyId);
    });

    return () => {
      unsubStory();
    };
  }, [storyId]);

  useEffect(() => {
    async function checkLikedStatus() {
      if (!storyId) {
        return;
      }

      if (!user?.uid) {
        setLiked(false);
        return;
      }

      const likeRef = doc(db, "stories", storyId, "likes", user.uid);
      const likeSnapshot = await getDoc(likeRef);
      setLiked(likeSnapshot.exists());
    }

    checkLikedStatus();
  }, [storyId, user?.uid]);

  const toggleLike = useCallback(async () => {
    if (!storyId) {
      return;
    }

    if (!user?.uid) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    if (busy) {
      return;
    }

    setBusy(true);

    const likeRef = doc(db, "stories", storyId, "likes", user.uid);
    const storyRef = doc(db, "stories", storyId);

    try {
      if (liked) {
        await deleteDoc(likeRef);
        await updateDoc(storyRef, { likesCount: increment(-1) });
        setLiked(false);
      } else {
        await setDoc(likeRef, { likedAt: serverTimestamp() });
        await updateDoc(storyRef, { likesCount: increment(1) });
        setLiked(true);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, liked, location, navigate, storyId, user?.uid]);

  return {
    liked,
    likesCount,
    toggleLike,
    loading: loading || busy,
  };
}
