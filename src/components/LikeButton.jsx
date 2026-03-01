import { useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import useLikes from "../hooks/useLikes";

export default function LikeButton({ storyId }) {
  const { liked, likesCount, toggleLike, loading } = useLikes(storyId);
  const [pulse, setPulse] = useState(false);

  const handleClick = async () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 250);
    await toggleLike();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition-all shadow-sm ${
        liked 
          ? "border-destructive/30 bg-destructive/10 text-destructive/90" 
          : "border-border bg-card text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive/80"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span
        className={`relative inline-flex items-center justify-center text-xl transition-transform duration-200 ${pulse ? "scale-150" : "scale-100"}`}
      >
        {liked ? (
          <AiFillHeart className="text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        ) : (
          <AiOutlineHeart className="drop-shadow-sm group-hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.3)] transition-colors" />
        )}
      </span>
      <span className="font-lora">{likesCount}</span>
    </button>
  );
}
