import React, { useEffect, useState } from "react";
import { RestaurantIcon, AbrechnungIcon, UserIcon } from "./adminIcons";
import AbrechnungenSection from "./AbrechnungenSection";
import AbrechnungForm from "./abrechnungForm";

const TABS = [
  { key: "tagesreport", icon: <RestaurantIcon className="w-7 h-7" />, label: "Tagesreport" },
  { key: "abrechnungen", icon: <AbrechnungIcon className="w-7 h-7" />, label: "Abrechnungen Übersicht" },
  { key: "neue_abrechnung", icon: <UserIcon className="w-7 h-7" />, label: "Neue Abrechnung" },
];

interface ManagerDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
    email?: string;
    restaurantId?: string;
    organizationId?: string;
  };
}

export default function ManagerDashboard({ user }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dailyStats, setDailyStats] = useState<{
    totalSales: number;
    totalCash: number;
    totalTeamTips: number;
    count: number;
  } | null>(null);
  const [dailyAbrechnungen, setDailyAbrechnungen] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [selectedWaiter, setSelectedWaiter] = useState<string>("");
  const [restaurantWaiters, setRestaurantWaiters] = useState<any[]>([]);
  const [abrechnungRefresh, setAbrechnungRefresh] = useState<number>(0);

  // Validate manager has restaurantId
  if (!user.restaurantId) {
    return (
      <div className="text-red-500 p-8 text-center font-bold">
        Manager muss einem Restaurant zugeordnet sein.
      </div>
    );
  }

  // Fetch waiters for the restaurant
  useEffect(() => {
    if (user.restaurantId && user.organizationId) {
      fetchWaiters();
    }
  }, [user.restaurantId, user.organizationId]);

  // Fetch daily stats when date changes
  useEffect(() => {
    if (activeTab === "tagesreport" && selectedDate) {
      fetchDailyStats();
    }
  }, [selectedDate, activeTab]);

  const fetchWaiters = async () => {
    try {
      const res = await fetch(`/api/users`);
      if (res.ok) {
        const allUsers = await res.json();
        // Filter for kellner/waiters in this restaurant
        const waiters = allUsers.filter(
          (u: any) => u.role === "kellner" && u.restaurantId === user.restaurantId
        );
        setRestaurantWaiters(waiters);
        if (waiters.length > 0) {
          setSelectedWaiter(waiters[0]._id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching waiters:", error);
    }
  };

  const fetchDailyStats = async () => {
    setLoading(true);
    try {
      // Calculate geschaefts_tag at midnight UTC
      const businessDay = new Date(selectedDate);
      const businessDayUTC = new Date(Date.UTC(
        businessDay.getFullYear(),
        businessDay.getMonth(),
        businessDay.getDate(),
        0, 0, 0, 0
      ));
      
      const res = await fetch(
        `/api/abrechnungen?restaurantId=${user.restaurantId}&geschaefts_tag=${businessDayUTC.toISOString()}`
      );
      
      if (res.ok) {
        const data = await res.json();
        
        // Store abrechnungen for display
        setDailyAbrechnungen(data);
        
        // Fetch user names for all unique userIds
        const userIds = [...new Set(data.map((a: any) => a.userId).filter(Boolean))];
        const namesMap: { [key: string]: string } = {};
        
        // Fetch all users and build name map
        try {
          const usersRes = await fetch('/api/users');
          if (usersRes.ok) {
            const users = await usersRes.json();
            users.forEach((u: any) => {
              if (u._id) namesMap[u._id] = u.name;
            });
            setUserNames(namesMap);
          }
        } catch (err: any) {
          console.error('Error fetching user names:', err);
        }
        
        // Calculate sums
        const stats = {
          totalSales: data.reduce((sum: number, a: any) => sum + (a.totalSales || 0), 0),
          totalCash: data.reduce((sum: number, a: any) => sum + (a.salesInCash || 0), 0),
          totalTeamTips: data.reduce((sum: number, a: any) => sum + (a.teamTips || 0), 0),
          count: data.length,
        };
        
        setDailyStats(stats);
      } else {
        console.error("Fehler beim Laden der Tagesstatistik");
        setDailyStats(null);
        setDailyAbrechnungen([]);
      }
    } catch (error: any) {
      console.error("Fehler beim Laden der Tagesstatistik:", error);
      setDailyStats(null);
      setDailyAbrechnungen([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (abrechnung: any) => {
    if (editingId === abrechnung._id) {
      // If already editing this row, do nothing
      return;
    }
    setEditingId(abrechnung._id);
    setEditData({ ...abrechnung });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/abrechnungen/${editingId}?userId=${user._id}&restaurantId=${editData.restaurant}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setEditingId(null);
        setEditData({});
        fetchDailyStats(); // Refresh data
      } else {
        const error = await res.json();
        alert(error.error || "Fehler beim Speichern");
      }
    } catch (err: any) {
      alert("Fehler beim Speichern");
    }
  };

  const handleDelete = async (abrechnungId: string) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/abrechnungen/${abrechnungId}?userId=${user._id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDailyStats(); // Refresh data
      } else {
        const error = await res.json();
        alert(error.error || "Fehler beim Löschen");
      }
    } catch (err: any) {
      alert("Fehler beim Löschen");
    }
  };

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    alert("PDF Export wird in Kürze verfügbar sein.");
  };

  return (
    <div className="relative w-full flex items-center justify-center py-0 z-10">
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-[90vw] h-64 rounded-full bg-gradient-radial from-purple-400 via-pink-500 to-transparent opacity-60 blur-[32px]" />
      </div>
      <div className="flex flex-col w-full max-w-[600px] px-0">
        {/* Tabs */}
        <div
          className="px-4 flex items-center w-full"
          style={{
            height: "auto",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            border: "2px solid rgba(168, 85, 247, 0.3)",
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
                className={`flex-1 min-w-[120px] max-w-[200px] px-2 py-2 rounded-t-lg transition border-b-2 flex flex-col items-center justify-center ${
                  activeTab === tab.key
                    ? "bg-purple-500 text-white border-b-purple-400"
                    : "bg-transparent text-purple-200 border-b-transparent hover:bg-purple-600 hover:text-white"
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
            border: "2px solid rgba(168, 85, 247, 0.3)",
            borderTop: "none",
            background: "rgba(30, 40, 60, 0.35)",
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg mb-6">
            {activeTab === "tagesreport" && "Tagesreport"}
            {activeTab === "abrechnungen" && "Abrechnungen Übersicht"}
            {activeTab === "neue_abrechnung" && "Neue Abrechnung"}
          </h2>
          
          <div className="w-full">
            {activeTab === "tagesreport" && (
              <div className="space-y-6">
                {/* Date Picker */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                  <label className="text-white font-medium text-sm">
                    Geschäftstag:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-purple-300/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Daily Abrechnungen List */}
                {loading ? (
                  <div className="text-white text-center py-8">Laden...</div>
                ) : dailyAbrechnungen.length > 0 ? (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full bg-white/5 backdrop-blur-sm text-white rounded-lg">
                      <thead>
                        <tr className="border-b border-purple-300/30">
                          <th className="px-3 py-2 text-left text-sm">Kellner</th>
                          <th className="px-3 py-2 text-left text-sm">Umsatz</th>
                          <th className="px-3 py-2 text-left text-sm">Bar</th>
                          <th className="px-3 py-2 text-left text-sm">Team Tips</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyAbrechnungen.map((abr) => (
                          <tr 
                            key={abr._id} 
                            onClick={() => handleEdit(abr)}
                            className={`border-b border-purple-300/20 cursor-pointer transition ${
                              editingId === abr._id 
                                ? 'bg-purple-500/20 ring-2 ring-purple-400/50' 
                                : 'hover:bg-white/10'
                            }`}
                          >
                            <td className="px-3 py-2 text-sm">
                              {userNames[abr.userId] || "N/A"}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {editingId === abr._id ? (
                                <input
                                  type="number"
                                  value={editData.totalSales || 0}
                                  onChange={(e) => setEditData({ ...editData, totalSales: Number(e.target.value) })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-20 px-2 py-1 bg-white/10 border border-purple-300/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                              ) : (
                                `€${(abr.totalSales || 0).toFixed(2)}`
                              )}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {editingId === abr._id ? (
                                <input
                                  type="number"
                                  value={editData.salesInCash || 0}
                                  onChange={(e) => setEditData({ ...editData, salesInCash: Number(e.target.value) })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-20 px-2 py-1 bg-white/10 border border-purple-300/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                              ) : (
                                `€${(abr.salesInCash || 0).toFixed(2)}`
                              )}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {editingId === abr._id ? (
                                <input
                                  type="number"
                                  value={editData.teamTips || 0}
                                  onChange={(e) => setEditData({ ...editData, teamTips: Number(e.target.value) })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-20 px-2 py-1 bg-white/10 border border-purple-300/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                              ) : (
                                `€${(abr.teamTips || 0).toFixed(2)}`
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {editingId && (
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium shadow-lg transition"
                        >
                          ✓ Speichern
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-sm font-medium shadow-lg transition"
                        >
                          ✕ Abbrechen
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-white text-center py-4 text-sm opacity-70">
                    Keine Abrechnungen für diesen Tag
                  </div>
                )}

                {/* Stats Display */}
                {loading ? (
                  <div className="text-white text-center py-8">Laden...</div>
                ) : dailyStats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-lg p-4">
                      <div className="text-purple-300 text-sm mb-1">Anzahl Abrechnungen</div>
                      <div className="text-white text-2xl font-bold">{dailyStats.count}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-lg p-4">
                      <div className="text-purple-300 text-sm mb-1">Gesamtumsatz</div>
                      <div className="text-white text-2xl font-bold">
                        €{dailyStats.totalSales.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-lg p-4">
                      <div className="text-purple-300 text-sm mb-1">Barumsatz</div>
                      <div className="text-white text-2xl font-bold">
                        €{dailyStats.totalCash.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-lg p-4">
                      <div className="text-purple-300 text-sm mb-1">Team-Trinkgeld</div>
                      <div className="text-white text-2xl font-bold">
                        €{dailyStats.totalTeamTips.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-white text-center py-8">
                    Keine Daten für diesen Geschäftstag verfügbar.
                  </div>
                )}

                {/* PDF Export Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleExportPDF}
                    disabled={!dailyStats || dailyStats.count === 0}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition"
                  >
                    📄 PDF Report Exportieren
                  </button>
                </div>
              </div>
            )}

            {activeTab === "abrechnungen" && (
              <AbrechnungenSection 
                user={{ ...user, role: "manager", email: user.email || "" }} 
                filterByRestaurant={user.restaurantId}
              />
            )}

            {activeTab === "neue_abrechnung" && (
              <div className="space-y-6">
                {/* Waiter Selection */}
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-cyan-100 font-medium text-sm">
                    Kellner auswählen:
                  </label>
                  <select
                    value={selectedWaiter}
                    onChange={(e) => setSelectedWaiter(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-cyan-900/30 backdrop-blur-sm border-2 border-cyan-400/30 text-cyan-100 hover:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
                  >
                    {restaurantWaiters.length === 0 ? (
                      <option value="">Keine Kellner gefunden</option>
                    ) : (
                      restaurantWaiters.map((waiter) => (
                        <option key={waiter._id} value={waiter._id}>
                          {waiter.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Abrechnung Form */}
                {selectedWaiter && (
                  <AbrechnungForm
                    user={{
                      name: restaurantWaiters.find(w => w._id === selectedWaiter)?.name || "Manager",
                      userId: selectedWaiter,
                      _id: selectedWaiter,
                    }}
                    restaurantId={user.restaurantId || ""}
                    orgId={user.organizationId || ""}
                    refresh={abrechnungRefresh}
                    onClose={() => {
                      // Refresh abrechnungen after submission
                      setAbrechnungRefresh(r => r + 1);
                      // Switch to tagesreport tab
                      setActiveTab("tagesreport");
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
