import { deleteDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { db } from "../../firebase/config";
import useStories from "../../hooks/useStories";

function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return "—";
  }

  try {
    if (typeof createdAt.toDate === "function") {
      return createdAt.toDate().toLocaleDateString();
    }
    return new Date(createdAt).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function AdminDashboard() {
  const { stories, loading, error } = useStories();
  const [storyList, setStoryList] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setStoryList(stories);
  }, [stories]);

  const handleDelete = async (storyId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this story?");
    if (!shouldDelete) {
      return;
    }

    setDeletingId(storyId);

    try {
      await deleteDoc(doc(db, "stories", storyId));
      setStoryList((previous) => previous.filter((story) => story.id !== storyId));
      toast.success("Story deleted successfully.");
    } catch (deleteError) {
      toast.error(deleteError.message || "Failed to delete story.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-playfair text-3xl font-bold text-amber-900">Admin Dashboard</h1>
        <Link
          to="/admin/add"
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
        >
          Add Story
        </Link>
      </header>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Failed to load stories: {error}
        </p>
      ) : null}

      {loading ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          Loading stories...
        </p>
      ) : null}

      {!loading && storyList.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          No stories exist yet.
        </p>
      ) : null}

      {!loading && storyList.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-amber-50">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-amber-100 text-amber-900">
              <tr>
                <th className="px-4 py-3 font-semibold">Cover</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {storyList.map((story) => {
                const coverImage = story.coverImageURL || story.coverImageUrl;

                return (
                  <tr key={story.id} className="border-t border-amber-200">
                    <td className="px-4 py-3">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={story.title}
                          className="h-14 w-20 rounded object-cover"
                        />
                      ) : (
                        <span className="text-amber-700">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-amber-900">{story.title}</td>
                    <td className="px-4 py-3 text-amber-800">
                      {Array.isArray(story.categories) && story.categories.length > 0
                        ? story.categories.join(", ")
                        : "General"}
                    </td>
                    <td className="px-4 py-3 text-amber-800">{formatCreatedAt(story.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(story.id)}
                        disabled={deletingId === story.id}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === story.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
