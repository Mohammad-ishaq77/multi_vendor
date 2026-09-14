const Skeleton = ({ className = "h-4 w-full" }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

export const CardSkeleton = () => (
  <div className="overflow-hidden rounded-[16px] border border-[var(--color-green-soft)] bg-white p-4">
    <Skeleton className="mb-4 h-40 w-full rounded-[12px]" />
    <Skeleton className="mb-2 h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export const StatSkeleton = () => (
  <div className="rounded-[16px] border border-[var(--color-green-soft)] bg-white p-5">
    <Skeleton className="mb-6 h-10 w-10 rounded-xl" />
    <Skeleton className="mb-2 h-7 w-24" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export default Skeleton;
