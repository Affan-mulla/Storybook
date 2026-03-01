import { Link } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import { FaCommentAlt } from "react-icons/fa";

export default function StoryCard({ story, isCompact = false }) {
  const coverImage = story.coverImageURL || story.coverImageUrl;
  const categories = Array.isArray(story.categories) ? story.categories : [];
  const categoriesLabel = categories.length > 0 ? categories.join(", ") : "General";
  const likesCount = Number(story.likesCount || 0);
  const commentsCount = Number(story.commentsCount || 0);

  return (
    <article className="group h-90 w-xs  flex flex-col overflow-hidden rounded-lg bg-card border border-border shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative">
      <Link to={`/story/${story.id}`} className="block relative w-full aspect-video sm:aspect-square overflow-hidden bg-muted">
        <img
          src={coverImage}
          alt={story.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2 flex items-center gap-1 flex-wrap">
           {
            categories.length > 0 ? categories.map((category, idx) => (
              <span key={idx} className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-1 rounded">
                {category}
              </span>
            )) : (
              <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-1 rounded">
                {categoriesLabel}
              </span>
           )
           }
        </div>

        <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground font-lora">
          <span className="inline-flex items-center gap-1">
            <AiFillHeart className="text-red-500" /> {likesCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <FaCommentAlt className="text-foreground/60" /> {commentsCount}
          </span>
        </div>
        
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {story.title}
        </h2>

        {!isCompact && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground font-lora">
            {story.description}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-border mt-auto">
          <Link
            to={`/story/${story.id}`}
            className="inline-flex w-full justify-center items-center rounded-lg bg-background border border-primary px-4 py-2 text-sm font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            Read Story
          </Link>
        </div>
      </div>
    </article>
  );
}
