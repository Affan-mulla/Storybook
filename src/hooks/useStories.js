import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

export default function useStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const minimumLoadingDuration = 450;

  useEffect(() => {
    let isMounted = true;

    async function fetchStories() {
      setLoading(true);
      setError(null);
      const loadingDelay = new Promise((resolve) => {
        setTimeout(resolve, minimumLoadingDuration);
      }); 
      console.log("Fetching stories from Firestore...");

      try {
        const [snapshot] = await Promise.all([
          getDocs(collection(db, "stories")),
          loadingDelay,
        ]);
        console.log("Raw Firestore snapshot:", snapshot);
        const storyList = snapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        }));
        console.log("Fetched stories:", storyList);

        if (isMounted) {
          setStories(storyList);
        }
      } catch (err) {
        await loadingDelay;
        console.error("Error fetching stories:", err);
        if (isMounted) {
          setError(err.message || "Failed to fetch stories.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { stories, loading, error };
}
