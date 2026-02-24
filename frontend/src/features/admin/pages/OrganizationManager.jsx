import React, { useState } from "react";
import {
  Building2,
  Plus,
  Globe,
  ShieldCheck,
  Search,
  Loader2,
} from "lucide-react";
import { UI_CONFIG } from "../../../config/constants";
import { MSG, ERR } from "../../../config/errMsgConstants";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import toast from "react-hot-toast";

const OrganizationManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    adminEmail: "",
    adminPassword: "",
  });

  const {
    data: orgs = [],
    isLoading,
    isError,
    refetch, 
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: adminService.getAllOrganizations,
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Setting up organization...");
    try {
      await adminService.createOrganization({
        name: formData.name,
        domain: formData.domain,
        fullName: formData.name,
        email: formData.adminEmail,
        password: formData.adminPassword,
        role: "ROLE_ORG_ADMIN",
      });

      setShowModal(false);
      refetch();
      toast.success(MSG.ORG_CREATED, { id: loadingToast });
      setFormData({ name: "", domain: "", adminEmail: "", adminPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || ERR.ACTION_FAILED, {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="space-y-8">
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Corporate Clients
          </h1>
          <p className="text-gray-500 mt-1">
            Manage organizations and their administrative access.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95"
        >
          <Plus size={20} /> Add New Organization
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${UI_CONFIG.CARD_STYLE} p-6`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-brand-primary rounded-2xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                Total Entities
              </p>
              <p className="text-3xl font-black text-gray-900">{orgs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className={`${UI_CONFIG.CARD_STYLE} overflow-hidden`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="font-bold text-gray-800 text-lg">
            Active Organizations
          </h3>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search domains..."
              className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Organization</th>
                <th className="px-8 py-5">Domain</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="animate-spin" />
                      Loading organizations...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-20 text-center text-red-500 font-bold"
                  >
                    {ERR.FETCH_FAILED}
                  </td>
                </tr>
              ) : (
                orgs.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-orange-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                          {org.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-800">
                          {org.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Globe size={14} /> {org.domain}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-xl rounded-hb p-10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
            >
              ✕
            </button>

            <div className="mb-8">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                New Org Setup
              </h3>
              <p className="text-gray-500">
                Create a secure corporate realm and administrative account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400 ml-1">
                    Company Name
                  </label>
                  <input
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="e.g. Acme Corp"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400 ml-1">
                    Corporate Domain
                  </label>
                  <input
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="acme.com"
                    onChange={(e) =>
                      setFormData({ ...formData, domain: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {}

              <div className="pt-4 border-t border-gray-100 mt-6">
                <div className="flex items-center gap-2 mb-4 text-brand-primary font-bold">
                  <ShieldCheck size={18} /> Primary Administrator
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="admin@domain.com"
                    onChange={(e) =>
                      setFormData({ ...formData, adminEmail: e.target.value })
                    }
                    required
                  />
                  <input
                    type="password"
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="Secure Password"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adminPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 p-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-brand-secondary transition-all"
                >
                  Launch Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManager;
