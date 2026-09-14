import { PackageOpen } from "lucide-react";

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = "Nothing here yet",
  description = "When data is available, it will appear in this space.",
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[var(--color-green-soft)] bg-[var(--color-green-bg)]/50 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--color-primary)] shadow-[var(--shadow-card)]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
