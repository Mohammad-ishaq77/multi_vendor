import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogoutConfirm } from "../../context/LogoutContext";

const DashboardNavFooter = ({ isCollapsed = false, compact = false }) => {
  const navigate = useNavigate();
  const { requestLogout } = useLogoutConfirm();

  const actions = [
    {
      id: "site",
      label: "View to Site",
      icon: ExternalLink,
      onClick: () => navigate("/"),
      hover: "hover:bg-[var(--color-green-bg)] hover:text-[var(--color-primary-dark)]",
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      onClick: requestLogout,
      hover: "hover:bg-emerald-50/80 hover:text-emerald-700",
    },
  ];

  return (
    <div className={compact ? "space-y-0.5" : "space-y-0.5"}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            type="button"
            whileHover={{ x: isCollapsed ? 0 : 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-400 transition-all duration-200 ${action.hover} ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] bg-gray-50 text-gray-400">
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap text-[0.82rem] font-semibold"
                >
                  {action.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
};

export const DashboardMobileFooter = () => {
  const navigate = useNavigate();
  const { requestLogout } = useLogoutConfirm();

  return (
    <div className="space-y-0.5 border-t border-gray-100 p-3">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-green-bg)]"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[var(--color-green-bg)] text-[var(--color-primary)]">
          <ExternalLink className="h-[18px] w-[18px]" />
        </div>
        View to Site
      </button>
      <button
        type="button"
        onClick={requestLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-emerald-50 text-emerald-700">
          <LogOut className="h-[18px] w-[18px]" />
        </div>
        Logout
      </button>
    </div>
  );
};

export default DashboardNavFooter;
