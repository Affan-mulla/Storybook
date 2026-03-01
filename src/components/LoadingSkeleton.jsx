export default function LoadingSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
      <div className="h-52 w-full animate-pulse bg-amber-200" />
      <div className="space-y-3 p-5">
        <div className="h-7 w-3/5 animate-pulse rounded bg-amber-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-amber-200" />
        <div className="h-4 w-full animate-pulse rounded bg-amber-200" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-amber-200" />
        <div className="h-9 w-28 animate-pulse rounded bg-amber-300" />
      </div>
    </article>
  );
}
