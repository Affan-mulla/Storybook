import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import StoryCard from "../components/StoryCard";
import useStories from "../hooks/useStories";

export default function Discover() {
  const { stories, loading, error } = useStories();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    filterParam === "originals" ? "Originals" : "All"
  );

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(
      stories.flatMap((story) =>
        Array.isArray(story.categories)
          ? story.categories.filter(Boolean)
          : [],
      ),
    ));
    return ["All", ...uniqueCategories];
  }, [stories]);

  const filteredStories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return stories.filter((story) => {
      const storyCategories = Array.isArray(story.categories) ? story.categories : [];
      const matchesCategory =
        activeCategory === "All" ||
        storyCategories.some(
          (category) => category.toLowerCase() === activeCategory.toLowerCase(),
        );
      const matchesSearch = (story.title || "")
        .toLowerCase()
        .includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [stories, activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">  
      <section className="mx-auto max-w-[1280px] space-y-8">
        <header className="space-y-3 pb-6 border-b border-border">
          <h1 className="font-playfair text-3xl font-bold text-foreground sm:text-4xl border-l-4 border-primary pl-4">
            Discover Stories
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground font-lora pl-5 sm:text-base">      
            Find your next favorite tale from our growing collection.
          </p>
        </header>

        <div className="space-y-6">
          <input
            type="search"
            placeholder="Search stories by title..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-full border border-border bg-card px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-lora"                                                                    />

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = category === activeCategory;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-bold font-lora tracking-wider transition-all ${
                     isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 font-lora">
            Failed to load stories: {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} isCompact={false} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card px-8 py-16 text-center shadow-sm">
            <p className="text-foreground font-playfair text-xl">No stories match your search or filter.</p>
            <p className="text-muted-foreground font-lora mt-2">Try clearing your search or switching categories.</p>
          </div>
        )}
      </section>
    </main>
  );
}
