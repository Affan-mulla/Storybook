import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaCommentAlt } from "react-icons/fa";
import {
  Timestamp,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";

const RANGE_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

function getRangeStart(range) {
  const now = new Date();

  switch (range) {
    case "day":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    case "week":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case "year":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "month":
    default:
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  }
}

export default function Trending() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("month");

  useEffect(() => {
    let isMounted = true;

    async function fetchTrendingStories() {
      setLoading(true);
      setError("");

      try {
        const startDate = getRangeStart(range);

        const storiesQuery = query(
          collection(db, "stories"),
          where("createdAt", ">=", Timestamp.fromDate(startDate)),
          orderBy("createdAt", "desc"),
          limit(100),
        );

        const snapshot = await getDocs(storiesQuery);
        const fetchedStories = snapshot.docs.map((storyDoc) => ({
          id: storyDoc.id,
          ...storyDoc.data(),
        }));

        if (isMounted) {
          setStories(fetchedStories);
        }
      } catch (fetchError) {
        if (isMounted) {
          setStories([]);
          setError(
            fetchError.message ||
              "Failed to fetch trending stories for this timeframe.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTrendingStories();

    return () => {
      isMounted = false;
    };
  }, [range]);

  const trendingStories = useMemo(() => {
    return [...stories]
      .sort((a, b) => {
        const scoreA = Number(a.likesCount || 0) + Number(a.commentsCount || 0);
        const scoreB = Number(b.likesCount || 0) + Number(b.commentsCount || 0);

        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }

        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
  }, [stories]);

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3 pb-6 border-b border-border">
          <h1 className="font-playfair text-3xl font-bold text-foreground sm:text-5xl border-l-4 border-primary pl-4">
            Trending Stories
          </h1>
          <p className="text-sm text-muted-foreground font-lora pl-5 sm:text-base">      
            Discover the hottest and fastest-growing stories in StoryBook.
          </p>

          <div className="pl-5 pt-2">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-card p-1">
              {RANGE_OPTIONS.map((option) => {
                const isActive = range === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {error ? (
          <p className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 font-lora">
            Failed to load stories: {error}
          </p>
        ) : null}

        {loading ? (
          <div className="space-y-6 animate-pulse">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="h-40 bg-card rounded-2xl"></div>
             ))}
          </div>
        ) : trendingStories.length > 0 ? (
          <div className="flex flex-col space-y-6">
            {trendingStories.map((story, idx) => (
              <Link key={story.id} to={`/story/${story.id}`} className="group flex flex-col sm:flex-row items-center sm:items-start p-6 rounded-2xl bg-card border border-border hover:border-primary hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                
                {/* Ranking */}
                <div className="absolute top-0 right-0 sm:static sm:mr-6 p-4 sm:p-0">
                  <span className={`font-playfair text-5xl sm:text-7xl font-black transition-colors ${idx < 3 ? 'text-primary' : 'text-border group-hover:text-primary/50'}`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                </div>
                
                {/* Thumbnail */}
                <div className="w-full sm:w-32 h-48 sm:h-40 flex-shrink-0 rounded-xl overflow-hidden bg-muted shadow-md group-hover:shadow-lg transition-shadow mb-4 sm:mb-0">
                  <img src={story.coverImageURL || story.coverImageUrl} alt={story.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                
                {/* Details */}
                <div className="flex-grow flex flex-col justify-center sm:ml-2">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-1 rounded">
                      {Array.isArray(story.categories) && story.categories.length > 0
                        ? story.categories.join(", ")
                        : "General"}
                    </span>
                    <span className="text-xs font-bold text-foreground bg-foreground/5 px-2 py-1 rounded border border-border">Updated Recently</span>
                  </div>
                  
                  <h3 className="font-playfair text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{story.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground font-lora line-clamp-2 leading-relaxed">
                    {story.description}
                  </p>

                  {story.createdAt ? (
                    <p className="mt-2 text-xs text-muted-foreground font-lora">
                      {story.createdAt?.toDate
                        ? story.createdAt.toDate().toLocaleDateString()
                        : new Date(story.createdAt).toLocaleDateString()}
                    </p>
                  ) : null}
                  
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground flex items-center gap-2 font-lora">
                      <FaHeart className="text-destructive/80" /> {Number(story.likesCount || 0)}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-2 font-lora">
                      <FaCommentAlt className="text-foreground/50" /> {Number(story.commentsCount || 0)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card px-8 py-16 text-center shadow-sm">
            <p className="text-foreground font-playfair text-xl">No trending stories found.</p>
          </div>
        )}
      </section>
    </main>
  );
}
