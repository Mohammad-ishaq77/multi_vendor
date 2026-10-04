import { ShoppingBag, Store, Truck } from "lucide-react";
import { PUBLIC_ROLE_META } from "../../../config/roles";

const roleIcons = {
  Store,
  ShoppingBag,
  Truck,
};

const RoleSelector = ({ legend, selectedRole, onSelect }) => (
  <fieldset>
    <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--color-text)">
      {legend}
    </legend>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {PUBLIC_ROLE_META.map((item) => {
        const Icon = roleIcons[item.icon] || ShoppingBag;
        const active = selectedRole === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-[12px] border px-2 py-3 text-center text-xs font-semibold transition-all ${
              active
                ? "border-(--color-primary) bg-(--color-green-bg) text-(--color-primary-dark) shadow-[var(--shadow-card)]"
                : "border-[#dce8e2] bg-white text-(--color-text-muted) hover:border-(--color-green-soft)"
            }`}
            aria-pressed={active}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  </fieldset>
);

export default RoleSelector;
