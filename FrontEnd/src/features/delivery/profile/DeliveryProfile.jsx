import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, ShieldCheck, Truck, Star, Settings } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function DeliveryProfile() {
  const navigate = useNavigate();
  const { profile, applicationStatus, identityData, addressData } = useDeliveryPartner();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your delivery partner profile</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 overflow-hidden">{profile.profileImage ? <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10" />}</div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-emerald-100 text-sm">{profile.email}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="text-sm font-semibold">{profile.rating}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm"><User className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Name</span><span className="ml-auto font-medium text-gray-700">{profile.name}</span></div>
              <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Email</span><span className="ml-auto font-medium text-gray-700">{profile.email}</span></div>
              <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Phone</span><span className="ml-auto font-medium text-gray-700">{profile.phone}</span></div>
            </div>
          </div>

          {/* Verification */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Verification</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span className="text-gray-700">Identity</span><span className="ml-auto text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">{identityData?.status === "verified" ? "Verified" : "Pending"}</span></div>
              <div className="flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span className="text-gray-700">Address</span><span className="ml-auto text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">{addressData?.aadhaarAddressMatch ? "Verified" : "Pending"}</span></div>
              <div className="flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span className="text-gray-700">Application</span><span className="ml-auto text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">{applicationStatus.replace("_", " ")}</span></div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Vehicle</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm"><Truck className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Type</span><span className="ml-auto font-medium text-gray-700">{profile.vehicleType}</span></div>
              <div className="flex items-center gap-3 text-sm"><Truck className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Number</span><span className="ml-auto font-medium text-gray-700">{profile.vehicleNumber}</span></div>
            </div>
          </div>

          {/* Performance */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Performance</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-md">
                <p className="text-lg font-bold text-gray-900">{profile.rating}</p>
                <p className="text-[0.6rem] text-gray-400">Rating</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-md">
                <p className="text-lg font-bold text-gray-900">{profile.completedDeliveries}</p>
                <p className="text-[0.6rem] text-gray-400">Completed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-md">
                <p className="text-lg font-bold text-gray-900">{profile.cancelledDeliveries}</p>
                <p className="text-[0.6rem] text-gray-400">Cancelled</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <button onClick={() => navigate("/delivery/profile/settings")} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
        <Settings className="w-4 h-4" /> Edit Profile
      </button>
    </div>
  );
}
