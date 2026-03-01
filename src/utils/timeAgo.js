export function timeAgo(timestamp) {
  const now = new Date();
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((now - date) / 1000);

  if (!Number.isFinite(diff) || diff < 0) {
    return "just now";
  }

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}
