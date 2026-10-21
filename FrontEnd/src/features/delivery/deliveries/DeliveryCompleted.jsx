import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Clock, Package, ArrowRight, Volume2 } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function DeliveryCompleted() {
  const navigate = useNavigate();
  const location = useLocation();
  const { deliveryHistory } = useDeliveryPartner();
  const [canReplaySuccessSound, setCanReplaySuccessSound] = useState(false);

  const delivery = location.state?.delivery || deliveryHistory[0];
  const deliveryId = delivery?.id || delivery?.orderId;

  const playSuccessSound = useCallback(() => {
    try {
      const audio = new Audio("/order-success.mp3");
      audio.volume = 0.7;
      audio.play().then(
        () => setCanReplaySuccessSound(false),
        () => setCanReplaySuccessSound(true)
      );
    } catch {
      setCanReplaySuccessSound(true);
    }
  }, []);

  useEffect(() => {
    if (!deliveryId) return;

    const playedKey = `nearmart:delivery-success:${deliveryId}`;
    try {
      if (window.sessionStorage.getItem(playedKey)) return;
      window.sessionStorage.setItem(playedKey, "attempted");
    } catch {
      // Still attempt playback when session storage is unavailable.
    }

    playSuccessSound();
  }, [deliveryId, playSuccessSound]);

  const earnings = Number(delivery?.partnerEarning);
  const formattedEarnings = Number.isFinite(earnings)
    ? earnings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">Congratulations! 🎉</h1>
          <p className="text-sm text-gray-600 mt-2">You completed this delivery successfully.</p>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center">
            <p className="text-sm font-semibold text-emerald-800">You earned</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-emerald-700">₹{formattedEarnings}</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-emerald-800">
              This amount will be credited to your account within 2 hours.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{delivery?.distance ?? "—"}{delivery?.distance != null ? " km" : ""}</p>
              <p className="text-[0.6rem] text-gray-400">Distance</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{delivery?.estimatedTime ?? "—"}</p>
              <p className="text-[0.6rem] text-gray-400">Duration</p>
            </div>
          </div>

          {canReplaySuccessSound && (
            <div className="text-center">
              <button
                type="button"
                onClick={playSuccessSound}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
              >
                <Volume2 className="h-4 w-4" />
                Play confirmation sound
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={() => navigate("/delivery/history")} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
              <Package className="w-4 h-4" /> View History
            </button>
            <button onClick={() => navigate("/delivery/dashboard")} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
              Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
