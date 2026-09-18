import { useState } from "react";
import { motion } from "framer-motion";
import { User, Save, CheckCircle, Mail, Phone, Shield } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

export default function AdminProfile() {
  const { adminProfile, updateAdminProfile } = useAdmin();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: adminProfile?.name || "Admin",
    email: adminProfile?.email || "admin@nearmart.in",
    phone: adminProfile?.phone || "+91 9876543210",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateAdminProfile(form);
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageTransition>
      <div className="w-full space-y-6">
        <div><h1 className="text-2xl font-bold text-[#14261f]">Admin Profile</h1><p className="text-sm text-gray-500 mt-1">Manage your account information.</p></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#155c43] to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {form.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{form.name}</h2>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              {editMode ? (
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:border-[#155c43] focus:ring-2 focus:ring-[#155c43]/10 outline-none transition-all" />
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-md text-sm text-gray-700"><User className="w-4 h-4 text-gray-400" />{form.name}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              {editMode ? (
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:border-[#155c43] focus:ring-2 focus:ring-[#155c43]/10 outline-none transition-all" />
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-md text-sm text-gray-700"><Mail className="w-4 h-4 text-gray-400" />{form.email}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
              {editMode ? (
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:border-[#155c43] focus:ring-2 focus:ring-[#155c43]/10 outline-none transition-all" />
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-md text-sm text-gray-700"><Phone className="w-4 h-4 text-gray-400" />{form.phone}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-md text-sm text-gray-700"><Shield className="w-4 h-4 text-gray-400" />Administrator</div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            {editMode ? (
              <>
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#155c43] text-white text-sm font-semibold rounded-md hover:bg-[#155c43]/90 transition-colors"><Save className="w-4 h-4" /> Save Changes</button>
                <button onClick={() => setEditMode(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors">Edit Profile</button>
            )}
          </div>

          {saved && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4" /> Profile updated successfully.
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
