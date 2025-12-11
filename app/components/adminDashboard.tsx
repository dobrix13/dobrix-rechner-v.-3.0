import React, { useEffect, useState } from "react";
import { useOrganizations } from "../hooks/useOrganizations";
import { useRestaurants } from "../hooks/useRestaurants";
import { useUsers } from "../hooks/useUsers";
import { useAbrechnungen } from "../hooks/useAbrechnungen";
import { OrganizationIcon, RestaurantIcon, UserIcon, AbrechnungIcon } from "./adminIcons";

import OrganizationsSection from "./OrganizationsSection";
import RestaurantsSection from "./RestaurantsSection";
import UsersSection from "./UsersSection";
import AbrechnungenSection from "./AbrechnungenSection";

const TABS = [
  { key: "organizations", icon: <OrganizationIcon className="w-7 h-7" />, label: "Firmen" },
  { key: "restaurants", icon: <RestaurantIcon className="w-7 h-7" />, label: "Restaurants" },
  { key: "users", icon: <UserIcon className="w-7 h-7" />, label: "Benutzern" },
  { key: "abrechnungen", icon: <AbrechnungIcon className="w-7 h-7" />, label: "Abrechnungen" },
];

export default function AdminDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  // Accept userId as _id for compatibility
  const userObj = user && typeof user === 'object'
    ? { ...user, _id: user._id || user.userId }
    : null;
  if (!userObj || !userObj._id) {
    return <div className="text-red-500 p-8 text-center font-bold">Kein authentifizierter Benutzer gefunden. Bitte einloggen.</div>;
  }
  return (
    <div className="relative w-full flex items-center justify-center py-0 z-10">
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-[90vw] h-64 rounded-full bg-gradient-radial from-cyan-400 via-fuchsia-500 to-transparent opacity-60 blur-[32px]" />
      </div>
      <div className="flex flex-col w-full max-w-[600px] px-0">
        {/* Tabs as window tabs in top part of frame */}
        <div
          className="px-4 flex items-center w-full"
          style={{
            height: "auto",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            border: "2px solid rgba(0,255,247,0.18)",
            background: "rgba(30, 40, 60, 0.45)",
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "none",
            fontSize: "0.95rem",
          }}
        >
          <div className="flex flex-wrap gap-2 w-full justify-center">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`flex-1 min-w-[70px] max-w-[120px] px-2 py-2 rounded-t-lg transition border-b-2 flex flex-col items-center justify-center ${
                  activeTab === tab.key
                    ? "bg-cyan-500 text-white border-b-cyan-400"
                    : "bg-transparent text-cyan-200 border-b-transparent hover:bg-cyan-600 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.key)}
                aria-label={tab.key}
              >
                {tab.icon}
                <span className="text-[0.7rem] mt-1 text-white font-medium drop-shadow-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Glass panel main block */}
        <div
          className="flex flex-col items-center px-8 py-8"
          style={{
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
            border: "2px solid rgba(0,255,247,0.18)",
            borderTop: "none",
            background: "rgba(30, 40, 60, 0.35)",
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg mb-6">
            {activeTab === "organizations" && "Firmen"}
            {activeTab === "restaurants" && "Restaurants"}
            {activeTab === "users" && "Benutzern"}
            {activeTab === "abrechnungen" && "Abrechnungen"}
          </h2>
          <div className="w-full">
            {activeTab === "organizations" && <OrganizationsSection user={userObj} />}
            {activeTab === "restaurants" && <RestaurantsSection user={userObj} />}
            {activeTab === "users" && <UsersSection user={userObj} />}
            {activeTab === "abrechnungen" && <AbrechnungenSection user={userObj} />}
          </div>
        </div>
      </div>
    </div>
  );
}




