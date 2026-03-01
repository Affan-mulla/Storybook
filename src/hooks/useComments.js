import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";

export default function useComments(storyId) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [comments, setComments] = useState([]);
  const [loadedForStoryId, setLoadedForStoryId] = useState(null);

  const loading = Boolean(storyId) && loadedForStoryId !== storyId;

  useEffect(() => {
    if (!storyId) {
      return;
    }

    const commentsRef = collection(db, "stories", storyId, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((commentDoc) => ({
          id: commentDoc.id,
          ...commentDoc.data(),
        }));
        setComments(items);
        setLoadedForStoryId(storyId);
      },
      () => {
        setComments([]);
        setLoadedForStoryId(storyId);
      },
    );

    return () => unsubscribe();
  }, [storyId]);

  const addComment = async (text) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    if (!user?.uid) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    const userEmail = (user.email || "user").split("@")[0];

    await addDoc(collection(db, "stories", storyId, "comments"), {
      userId: user.uid,
      userEmail,
      text: trimmedText.slice(0, 500),
      createdAt: serverTimestamp(),
    });
  };

  const deleteComment = async (commentId) => {
    if (!user?.uid || !commentId) {
      return;
    }

    await deleteDoc(doc(db, "stories", storyId, "comments", commentId));
  };

  return { comments, addComment, deleteComment, loading };
}
