import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineDelete } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useComments from "../hooks/useComments";
import LoadingSkeleton from "./LoadingSkeleton";
import { timeAgo } from "../utils/timeAgo";

export default function CommentSection({ storyId }) {
  const { user } = useAuth();
  const location = useLocation();
  const { comments, addComment, deleteComment, loading } = useComments(storyId);

  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePost = async (event) => {
    event.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Comment cannot be empty.");
      return;
    }

    if (trimmed.length > 500) {
      toast.error("Comment must be 500 characters or fewer.");
      return;
    }

    setSubmitting(true);
    try {
      await addComment(trimmed);
      setText("");
    } catch (error) {
      toast.error(error.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error(error.message || "Failed to delete comment.");
    }
  };

  const charCount = text.length;

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card/30 p-6 sm:p-8 shadow-inner backdrop-blur-sm mt-8">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
         <h3 className="font-playfair text-2xl font-bold text-foreground">Reader Comments</h3>
         <span className="bg-primary/20 text-primary px-3 py-0.5 rounded-full text-xs font-bold font-mono border border-primary/20">{comments.length}</span>
      </div>

      {user ? (
        <form onSubmit={handlePost} className="space-y-4">
          <div className="relative group">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={500}
              placeholder="What are your thoughts on this story?"
              className="min-h-[120px] w-full rounded-2xl border border-border bg-background/50 px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-lora text-base resize-none shadow-inner"
            />
            <div className={`absolute bottom-4 right-4 text-xs font-mono font-bold px-2 py-1 rounded-md backdrop-blur-md ${charCount > 450 ? 'bg-destructive/20 text-destructive' : 'bg-background/80 text-muted-foreground'}`}>
              {charCount} / 500
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="rounded-full bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[2px] border-primary-foreground/30 border-t-primary-foreground"></span>
                  Posting...
                </>
              ) : "Publish Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 text-center shadow-inner">
          <p className="font-lora text-foreground mb-3">Join the community to share your thoughts.</p>
          <Link
            to="/login"
            state={{ from: location }}
            className="inline-block rounded-full bg-foreground text-background px-6 py-2 text-sm font-bold transition-transform hover:scale-105"
          >
            Log In to Comment
          </Link>
        </div>
      )}

      <div className="pt-4 space-y-4">
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
           <p className="font-lora text-muted-foreground italic">No whispers in the woods yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const username = comment.userEmail || "Anonymous";
            const avatar = username.charAt(0).toUpperCase();
            const ownComment = comment.userId === user?.uid;

            return (
              <article
                key={comment.id}
                className={`rounded-2xl border ${ownComment ? 'border-primary/30 bg-primary/5' : 'border-border bg-background/50'} p-5 transition-colors hover:border-primary/50 group`}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 font-playfair font-black text-primary-foreground shadow-md">
                      {avatar}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm tracking-wide">
                        {username.split('@')[0]}
                        {ownComment && <span className="ml-2 bg-primary/20 text-primary text-[10px] uppercase px-2 py-0.5 rounded-full border border-primary/20">You</span>}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{timeAgo(comment.createdAt)}</p>
                    </div>
                  </div>

                  {ownComment && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="rounded-full p-2 text-muted-foreground/50 transition-all hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100"
                      aria-label="Delete comment"
                      title="Delete your comment"
                    >
                      <AiOutlineDelete className="text-xl" />
                    </button>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-lora ml-[52px]">
                  {comment.text}
                </p>
              </article>
            );
          })}
        </div>
      )}
      </div>
    </section>
  );
}
