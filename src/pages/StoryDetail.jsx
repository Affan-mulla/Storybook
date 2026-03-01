import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaChevronLeft, FaBookOpen, FaUserCircle } from "react-icons/fa";
import AudioPlayer from "../components/AudioPlayer";
import CommentSection from "../components/CommentSection";
import LikeButton from "../components/LikeButton";
import { db } from "../firebase/config";

function StoryDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      {/* Skeleton Nav */}
      <div className="h-16 w-full animate-pulse bg-card border-b border-border" />

      {/* Skeleton Header Image */}
      <div className="relative w-full h-[40vh] min-h-[300px] animate-pulse bg-muted max-h-[500px]" />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 relative -mt-32">
        <div className="h-40 w-full animate-pulse rounded-2xl bg-card border border-border shadow-xl backdrop-blur-md mb-12" />
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </main>
  );
}

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchStoryById() {
      setLoading(true);
      setError("");

      try {
        const snapshot = await getDoc(doc(db, "stories", id));

        if (!snapshot.exists()) {
          if (isMounted) {
            setError("Story not found.");
            setStory(null);
          }
          return;
        }

        if (isMounted) {
          setStory({ id: snapshot.id, ...snapshot.data() });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load story.");
          setStory(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStoryById();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <StoryDetailSkeleton />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="rounded-xl border border-destructive/50 bg-destructive/10 px-6 py-4 text-destructive font-lora text-lg">
            {error}
          </p>
          <Link to="/discover" className="inline-flex items-center gap-2 text-primary hover:text-foreground transition-colors font-bold">
            <FaChevronLeft /> Back to Discovery
          </Link>
        </div>
      </main>
    );
  }

  if (!story) {
    return null;
  }

  const coverImage = story.coverImageURL || story.coverImageUrl;
  const audioSource = story.audioURL || story.audioUrl;
  const categories = Array.isArray(story.categories) && story.categories.length > 0
    ? story.categories
    : story.category
      ? [story.category]
      : ["General"];

  return (
    <main className="min-h-screen bg-background pb-20">

      {/* Immersive Hero Header */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] bg-muted overflow-hidden">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={story.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
            {/* Dark gradient overlay for smooth transition into content */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 via-45% to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-card to-background grid-pattern"></div>
        )}

        {/* Top Floating Navigation */}
        <div className="absolute top-0 left-0 w-full p-4 sm:p-6 z-10">
          <Link to="/discover" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 hover:bg-primary border border-border hover:border-primary text-foreground hover:text-primary-foreground backdrop-blur-md transition-all text-sm font-bold shadow-md">
            <FaChevronLeft /> Browse Books
          </Link>
        </div>
      </div>

      {/* Main Content Container - Floats up over the hero image */}
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 relative -mt-40 z-10">

        {/* Title Card */}
        <header className="bg-card/80 backdrop-blur-xl border border-border p-8 sm:p-10 rounded-3xl shadow-2xl space-y-6 text-center mb-12">

          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="inline-block rounded-md bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary"
              >
                {category}
              </span>
            ))}
            <LikeButton storyId={id} />
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-tight">
            {story.title}
          </h1>

          {story.description && (
            <p className="font-lora text-lg text-muted-foreground/80 italic max-w-2xl mx-auto">
              "{story.description}"
            </p>
          )}

          <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-center gap-3 text-muted-foreground">
            <FaUserCircle className="text-2xl" />
            <span className="font-lora text-sm">Published by <strong className="text-foreground">StoryBook Author</strong></span>
          </div>

        </header>

        {/* Action Bar (Audio Player) */}
        {audioSource && (
          <div className="mb-12 transition-all">
            <div className="bg-primary/5 border border-primary/20 p-1 rounded-3xl shadow-lg backdrop-blur-md">
              <AudioPlayer src={audioSource} />
            </div>
          </div>
        )}

        {/* The Manuscript */}
        <article className="prose prose-invert max-w-none prose-p:font-lora prose-p:text-lg prose-p:leading-loose prose-p:text-foreground/90 prose-headings:font-playfair prose-headings:text-foreground">
          <div className="flex items-center justify-center mb-8 opacity-50">
            <div className="h-px bg-border flex-grow"></div>
            <FaBookOpen className="mx-4 text-2xl text-primary" />
            <div className="h-px bg-border flex-grow"></div>
          </div>

          <div className="whitespace-pre-line font-lora text-lg leading-[2.2] text-foreground/90 first-letter:float-left first-letter:text-6xl first-letter:pr-2 first-letter:font-playfair first-letter:text-primary first-letter:font-black">
            {story.fullContent}
          </div>

          <div className="flex items-center justify-center mt-16 mb-8 opacity-50">
            <div className="w-2 h-2 rounded-full bg-primary mx-1"></div>
            <div className="w-2 h-2 rounded-full bg-primary mx-1"></div>
            <div className="w-2 h-2 rounded-full bg-primary mx-1"></div>
          </div>
        </article>

        <div className="mb-12">
          <CommentSection storyId={id} />
        </div>

      </div>
    </main>
  );
}
