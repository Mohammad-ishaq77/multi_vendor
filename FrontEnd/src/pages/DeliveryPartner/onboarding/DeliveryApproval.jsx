import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Clock, FileCheck, ShieldCheck, UserCheck, Loader2 } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function DeliveryApproval() {
  const navigate = useNavigate();
  const { applicationStatus, simulateApproval } = useDeliveryPartner();

  useEffect(() => {
    if (applicationStatus === "approved") {
      const timer = setTimeout(() => navigate("/deliverypartner/dashboard"), 1500);
      return () => clearTimeout(timer);
    }
  }, [applicationStatus, navigate]);

  const steps = [
    { label: "Application Submitted", icon: FileCheck, done: true },
    { label: "Documents Reviewed", icon: ShieldCheck, done: applicationStatus === "approved" },
    { label: "Admin Approval", icon: UserCheck, done: applicationStatus === "approved" },
    { label: "Account Activated", icon: CheckCircle, done: applicationStatus === "approved" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h1 className="text-xl font-bold">Application Status</h1>
          <p className="text-emerald-100 text-sm mt-1">Track your delivery partner application</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Summary */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            applicationStatus === "approved" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
          }`}>
            {applicationStatus === "approved" ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            )}
            <div>
              <p className={`text-sm font-semibold ${applicationStatus === "approved" ? "text-emerald-800" : "text-amber-800"}`}>
                {applicationStatus === "approved" ? "Account Approved!" : "Pending Admin Approval"}
              </p>
              <p className={`text-xs ${applicationStatus === "approved" ? "text-emerald-600" : "text-amber-600"}`}>
                {applicationStatus === "approved" ? "Redirecting to dashboard..." : "Your application is under review."}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.done ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {step.done ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-8 ${step.done ? "bg-emerald-200" : "bg-gray-200"}`} />
                  )}
                  </div>
                <div className="pb-6">
                  <p className={`text-sm font-semibold ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                  <p className="text-xs text-gray-400">{step.done ? "Completed" : "Pending"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Simulate Approval Button (for dev/testing) */}
          {applicationStatus !== "approved" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-600 font-medium mb-3">Development Control: Simulate admin approval for testing</p>
              <button
                onClick={simulateApproval}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
              >
                Simulate Admin Approval
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
