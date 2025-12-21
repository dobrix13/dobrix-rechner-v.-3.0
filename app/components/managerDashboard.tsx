import React, { useEffect, useState, useRef } from "react";
import { RestaurantIcon, AbrechnungIcon, UserIcon } from "./adminIcons";
import AbrechnungenSection from "./AbrechnungenSection";
import AbrechnungForm from "./abrechnungForm";
import { generatePdfReport } from "../utils/generatePdfReport";

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
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [selectedWaiter, setSelectedWaiter] = useState<string>("");
  const [restaurantWaiters, setRestaurantWaiters] = useState<any[]>([]);
  const [abrechnungRefresh, setAbrechnungRefresh] = useState<number>(0);
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [organizationInfo, setOrganizationInfo] = useState<any>(null);
  const [pdfNotification, setPdfNotification] = useState<string | null>(null);
  const [tresorbestand, setTresorbestand] = useState<string>("");
  const [safebagNr, setSafebagNr] = useState<string>("");
  const [barcodeProcessing, setBarcodeProcessing] = useState(false);
  const barcodeFileRef = useRef<HTMLInputElement>(null);
  
  // Safebag money breakdown
  const [bills500, setBills500] = useState<string>("");
  const [bills200, setBills200] = useState<string>("");
  const [bills100, setBills100] = useState<string>("");
  const [bills50, setBills50] = useState<string>("");
  const [bills20, setBills20] = useState<string>("");
  const [bills10, setBills10] = useState<string>("");
  const [bills5, setBills5] = useState<string>("");
  const [munzen, setMunzen] = useState<string>("");
  
  // Amount inputs for safebag (alternative input method)
  const [amount500, setAmount500] = useState<string>("");
  const [amount200, setAmount200] = useState<string>("");
  const [amount100, setAmount100] = useState<string>("");
  const [amount50, setAmount50] = useState<string>("");
  const [amount20, setAmount20] = useState<string>("");
  const [amount10, setAmount10] = useState<string>("");
  const [amount5, setAmount5] = useState<string>("");

  // Calculate safebag total
  const safebagTotal = 
    (parseFloat(bills500) || 0) * 500 +
    (parseFloat(bills200) || 0) * 200 +
    (parseFloat(bills100) || 0) * 100 +
    (parseFloat(bills50) || 0) * 50 +
    (parseFloat(bills20) || 0) * 20 +
    (parseFloat(bills10) || 0) * 10 +
    (parseFloat(bills5) || 0) * 5 +
    (parseFloat(munzen) || 0);

  const totalCashSales = dailyStats?.totalCash || 0;
  const safebagMatches = Math.abs(safebagTotal - totalCashSales) < 0.01;

  // Auto-calculate münzen if all bills are entered
  const billsTotal = 
    (parseFloat(bills500) || 0) * 500 +
    (parseFloat(bills200) || 0) * 200 +
    (parseFloat(bills100) || 0) * 100 +
    (parseFloat(bills50) || 0) * 50 +
    (parseFloat(bills20) || 0) * 20 +
    (parseFloat(bills10) || 0) * 10 +
    (parseFloat(bills5) || 0) * 5;
  
  const calculatedMunzen = totalCashSales - billsTotal;

  // Validate münzen max 4.99
  const munzenValue = parseFloat(munzen) || 0;
  const munzenInvalid = munzenValue > 4.99;

  // Validate if any field exceeds the remaining amount
  const remaining500 = totalCashSales - (parseFloat(bills200) || 0) * 200 - (parseFloat(bills100) || 0) * 100 - (parseFloat(bills50) || 0) * 50 - (parseFloat(bills20) || 0) * 20 - (parseFloat(bills10) || 0) * 10 - (parseFloat(bills5) || 0) * 5 - munzenValue;
  const remaining200 = totalCashSales - (parseFloat(bills500) || 0) * 500 - (parseFloat(bills100) || 0) * 100 - (parseFloat(bills50) || 0) * 50 - (parseFloat(bills20) || 0) * 20 - (parseFloat(bills10) || 0) * 10 - (parseFloat(bills5) || 0) * 5 - munzenValue;
  const remaining100 = totalCashSales - (parseFloat(bills500) || 0) * 500 - (parseFloat(bills200) || 0) * 200 - (parseFloat(bills50) || 0) * 50 - (parseFloat(bills20) || 0) * 20 - (parseFloat(bills10) || 0) * 10 - (parseFloat(bills5) || 0) * 5 - munzenValue;
  const remaining50 = totalCashSales - (parseFloat(bills500) || 0) * 500 - (parseFloat(bills200) || 0) * 200 - (parseFloat(bills100) || 0) * 100 - (parseFloat(bills20) || 0) * 20 - (parseFloat(bills10) || 0) * 10 - (parseFloat(bills5) || 0) * 5 - munzenValue;
  const remaining20 = totalCashSales - (parseFloat(bills500) || 0) * 500 - (parseFloat(bills200) || 0) * 200 - (parseFloat(bills100) || 0) * 100 - (parseFloat(bills50) || 0) * 50 - (parseFloat(bills10) || 0) * 10 - (parseFloat(bills5) || 0) * 5 - munzenValue;
  const remaining10 = totalCashSales - (parseFloat(bills500) || 0) * 500 - (parseFloat(bills200) || 0) * 200 - (parseFloat(bills100) || 0) * 100 - (parseFloat(bills50) || 0) * 50 - (parseFloat(bills20) || 0) * 20 - (parseFloat(bills5) || 0) * 5 - munzenValue;
  const remaining5 = totalCashSales - (parseFloat(bills500) || 0) * 500 - (parseFloat(bills200) || 0) * 200 - (parseFloat(bills100) || 0) * 100 - (parseFloat(bills50) || 0) * 50 - (parseFloat(bills20) || 0) * 20 - (parseFloat(bills10) || 0) * 10 - munzenValue;

  const bills500Invalid = (parseFloat(bills500) || 0) * 500 > remaining500 && remaining500 >= 0;
  const bills200Invalid = (parseFloat(bills200) || 0) * 200 > remaining200 && remaining200 >= 0;
  const bills100Invalid = (parseFloat(bills100) || 0) * 100 > remaining100 && remaining100 >= 0;
  const bills50Invalid = (parseFloat(bills50) || 0) * 50 > remaining50 && remaining50 >= 0;
  const bills20Invalid = (parseFloat(bills20) || 0) * 20 > remaining20 && remaining20 >= 0;
  const bills10Invalid = (parseFloat(bills10) || 0) * 10 > remaining10 && remaining10 >= 0;
  const bills5Invalid = (parseFloat(bills5) || 0) * 5 > remaining5 && remaining5 >= 0;

  // Validate manager has restaurantId
  if (!user.restaurantId) {
    return (
      <div className="text-red-500 p-8 text-center font-bold">
        Manager muss einem Restaurant zugeordnet sein.
      </div>
    );
  }

  // Fetch waiters and restaurant info
  useEffect(() => {
    if (user.restaurantId && user.organizationId) {
      fetchWaiters();
      fetchRestaurantInfo();
      fetchOrganizationInfo();
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
      // Parse selectedDate as UTC directly (selectedDate is in YYYY-MM-DD format)
      // Split the date string and create UTC date to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      const businessDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      console.log('Fetching tagesreport for:', {
        selectedDate,
        businessDayUTC: businessDayUTC.toISOString(),
        parsed: { year, month, day }
      });
      
      const res = await fetch(
        `/api/abrechnungen?restaurantId=${user.restaurantId}&geschaefts_tag=${businessDayUTC.toISOString()}`
      );
      
      if (res.ok) {
        const data = await res.json();
        
        console.log('Received abrechnungen:', data.length, 'records');
        if (data.length > 0) {
          console.log('Sample geschaefts_tag from DB:', data[0].geschaefts_tag);
        }
        
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

  const handleView = (abrechnung: any) => {
    if (viewingId === abrechnung._id) {
      // Toggle off if already viewing
      setViewingId(null);
      return;
    }
    setViewingId(abrechnung._id);
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

  const fetchRestaurantInfo = async () => {
    try {
      const res = await fetch(`/api/organizations/${user.organizationId}/restaurants/${user.restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurantInfo(data);
      }
    } catch (error: any) {
      console.error("Error fetching restaurant info:", error);
    }
  };

  const fetchOrganizationInfo = async () => {
    try {
      const res = await fetch(`/api/organizations/${user.organizationId}`);
      if (res.ok) {
        const data = await res.json();
        setOrganizationInfo(data);
      }
    } catch (error: any) {
      console.error("Error fetching organization info:", error);
    }
  };

  const handleExportPDF = () => {
    if (!dailyStats || dailyStats.count === 0) {
      alert("Keine Daten zum Exportieren.");
      return;
    }

    if (!restaurantInfo || !organizationInfo) {
      alert("Restaurant- oder Firmendaten werden geladen...");
      return;
    }

    // Format date for display (e.g., "10.12.2025")
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Prepare data for PDF
    const reportData = {
      firmName: organizationInfo.name || "N/A",
      restaurantName: restaurantInfo.name || "N/A",
      geschaeftsDatum: formattedDate,
      abrechnungen: dailyAbrechnungen.map(abr => ({
        _id: abr._id,
        waiter: {
          name: userNames[abr.userId] || "N/A"
        },
        umsatz: abr.totalSales || 0,
        bargeld: abr.salesInCash || 0,
        team_tip: abr.teamTips || 0,
        date: abr.date
      })),
      totals: {
        umsatz: dailyStats.totalSales,
        bargeld: dailyStats.totalCash,
        teamTip: dailyStats.totalTeamTips
      },
      tresorbestand: restaurantInfo?.tresorEnabled && tresorbestand ? tresorbestand : undefined,
      safebagNr: restaurantInfo?.safebagEnabled && safebagNr ? safebagNr : undefined,
      safebagBreakdown: restaurantInfo?.safebagEnabled && safebagNr ? {
        bills500: parseFloat(bills500) || 0,
        bills200: parseFloat(bills200) || 0,
        bills100: parseFloat(bills100) || 0,
        bills50: parseFloat(bills50) || 0,
        bills20: parseFloat(bills20) || 0,
        bills10: parseFloat(bills10) || 0,
        bills5: parseFloat(bills5) || 0,
        munzen: parseFloat(munzen) || 0,
        total: safebagTotal
      } : undefined
    };

    const filename = generatePdfReport(reportData);
    setPdfNotification(filename);
    
    // Auto-hide notification after 10 seconds
    setTimeout(() => setPdfNotification(null), 10000);
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
                          <th className="px-3 py-2 text-left text-sm">Ausgezahlt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyAbrechnungen.map((abr) => {
                          const ausgezahlt = (abr.salesInCash || 0) + (abr.teamTips || 0);
                          return (
                          <tr 
                            key={abr._id} 
                            onClick={() => handleView(abr)}
                            className={`border-b border-purple-300/20 cursor-pointer transition ${
                              viewingId === abr._id 
                                ? 'bg-purple-500/20 ring-2 ring-purple-400/50' 
                                : 'hover:bg-white/10'
                            }`}
                          >
                            <td className="px-3 py-2 text-sm">
                              {userNames[abr.userId] || "N/A"}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {(abr.totalSales || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {(abr.salesInCash || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {(abr.teamTips || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {ausgezahlt.toFixed(2)}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {viewingId && dailyAbrechnungen.find(a => a._id === viewingId) && (
                      <div className="mt-4 p-4 bg-purple-500/10 border border-purple-300/30 rounded-lg">
                        <h3 className="text-white font-bold mb-3">Abrechnung Details</h3>
                        {(() => {
                          const abr = dailyAbrechnungen.find(a => a._id === viewingId);
                          const ausgezahlt = (abr.salesInCash || 0) + (abr.teamTips || 0);
                          return (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="text-purple-200">Kellner:</div>
                              <div className="text-white font-medium">{userNames[abr.userId] || "N/A"}</div>
                              <div className="text-purple-200">Umsatz:</div>
                              <div className="text-white font-medium">€{(abr.totalSales || 0).toFixed(2)}</div>
                              <div className="text-purple-200">Bar:</div>
                              <div className="text-white font-medium">€{(abr.salesInCash || 0).toFixed(2)}</div>
                              <div className="text-purple-200">Team Tip:</div>
                              <div className="text-white font-medium">€{(abr.teamTips || 0).toFixed(2)}</div>
                              <div className="text-purple-200 font-bold">Ausgezahlt:</div>
                              <div className="text-white font-bold">€{ausgezahlt.toFixed(2)}</div>
                            </div>
                          );
                        })()}
                        <button
                          onClick={() => setViewingId(null)}
                          className="mt-3 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium shadow-lg transition"
                        >
                          Schließen
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

                {/* Tresor and Safebag inputs (conditional) */}
                {dailyStats && dailyStats.count > 0 && (restaurantInfo?.tresorEnabled || restaurantInfo?.safebagEnabled) && (
                  <div className="mt-6 space-y-4 bg-white/5 backdrop-blur-sm border border-cyan-300/30 rounded-lg p-4">
                    {restaurantInfo?.tresorEnabled && (
                      <div className="flex flex-col">
                        <label className="text-cyan-200 font-medium mb-2">
                          € Tresorbestand:
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={tresorbestand}
                          onChange={(e) => setTresorbestand(e.target.value)}
                          placeholder="0.00"
                          className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    )}
                    
                    {restaurantInfo?.safebagEnabled && (
                      <div className="flex flex-col">
                        <label className="text-cyan-200 font-medium mb-2">
                          Safebag Nr.:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={safebagNr}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 20);
                              setSafebagNr(value);
                            }}
                            placeholder="00342802481225565656"
                            maxLength={20}
                            className="px-3 py-2 pr-12 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono w-full"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={barcodeFileRef}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setBarcodeProcessing(true);
                                try {
                                  // Use ZXing library for proper barcode scanning
                                  const { BrowserMultiFormatReader } = await import('@zxing/library');
                                  
                                  // Create image from file
                                  const imageUrl = URL.createObjectURL(file);
                                  const img = new Image();
                                  
                                  await new Promise((resolve, reject) => {
                                    img.onload = resolve;
                                    img.onerror = reject;
                                    img.src = imageUrl;
                                  });
                                  
                                  // Scan barcode
                                  const codeReader = new BrowserMultiFormatReader();
                                  const result = await codeReader.decodeFromImageElement(img);
                                  
                                  // Clean up
                                  URL.revokeObjectURL(imageUrl);
                                  
                                  // Extract only digits from barcode
                                  const digits = result.getText().replace(/\D/g, '').slice(0, 20);
                                  
                                  if (digits.length >= 10) {
                                    setSafebagNr(digits);
                                  } else {
                                    alert('Keine gültige Barcode-Nummer gefunden. Bitte erneut versuchen.');
                                  }
                                } catch (err) {
                                  console.error('Barcode scan error:', err);
                                  alert('Barcode konnte nicht erkannt werden. Bitte stellen Sie sicher, dass das Bild klar ist und versuchen Sie es erneut.');
                                }
                                setBarcodeProcessing(false);
                                // Reset file input
                                if (barcodeFileRef.current) {
                                  barcodeFileRef.current.value = '';
                                }
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => barcodeFileRef.current?.click()}
                            disabled={barcodeProcessing}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 transition-colors disabled:opacity-50"
                            title="Barcode scannen"
                          >
                            {barcodeProcessing ? (
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
                        <div className="text-xs text-cyan-400 mt-1">
                          {safebagNr.length}/20 Ziffern
                        </div>
                        
                        {/* Safebag Money Breakdown */}
                        <div className="mt-4 space-y-3 p-4 bg-white/5 rounded border border-cyan-400/20">
                          <div className="text-cyan-200 font-medium mb-3">Safebag Inhalt:</div>
                          
                          {/* Bill inputs - one per line */}
                          <div className="space-y-2">
                            {/* €500 */}
                            <div className="flex items-center gap-2">
                              <label className="text-cyan-200 text-sm w-16">€ 500</label>
                              <span className="text-cyan-300 text-sm">x</span>
                              <input
                                type="number"
                                min="0"
                                value={bills500}
                                onChange={(e) => {
                                  setBills500(e.target.value);
                                  setAmount500(((parseFloat(e.target.value) || 0) * 500).toFixed(2));
                                }}
                                className={'px-2 py-1 w-16 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center ' + (bills500Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0"
                              />
                              <span className="text-cyan-300 text-sm">=</span>
                              <span className="text-cyan-300 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount500}
                                onChange={(e) => {
                                  setAmount500(e.target.value);
                                  const count = Math.floor((parseFloat(e.target.value) || 0) / 500);
                                  setBills500(count.toString());
                                }}
                                className={'px-2 py-1 w-24 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right ' + (bills500Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0.00"
                              />
                            </div>
                            
                            {/* €200 */}
                            <div className="flex items-center gap-2">
                              <label className="text-cyan-200 text-sm w-16">€ 200</label>
                              <span className="text-cyan-300 text-sm">x</span>
                              <input
                                type="number"
                                min="0"
                                value={bills200}
                                onChange={(e) => {
                                  setBills200(e.target.value);
                                  setAmount200(((parseFloat(e.target.value) || 0) * 200).toFixed(2));
                                }}
                                className={'px-2 py-1 w-16 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center ' + (bills200Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0"
                              />
                              <span className="text-cyan-300 text-sm">=</span>
                              <span className="text-cyan-300 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount200}
                                onChange={(e) => {
                                  setAmount200(e.target.value);
                                  const count = Math.floor((parseFloat(e.target.value) || 0) / 200);
                                  setBills200(count.toString());
                                }}
                                className={'px-2 py-1 w-24 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right ' + (bills200Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0.00"
                              />
                            </div>
                            
                            {/* €100 */}
                            <div className="flex items-center gap-2">
                              <label className="text-cyan-200 text-sm w-16">€ 100</label>
                              <span className="text-cyan-300 text-sm">x</span>
                              <input
                                type="number"
                                min="0"
                                value={bills100}
                                onChange={(e) => {
                                  setBills100(e.target.value);
                                  setAmount100(((parseFloat(e.target.value) || 0) * 100).toFixed(2));
                                }}
                                className={'px-2 py-1 w-16 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center ' + (bills100Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0"
                              />
                              <span className="text-cyan-300 text-sm">=</span>
                              <span className="text-cyan-300 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount100}
                                onChange={(e) => {
                                  setAmount100(e.target.value);
                                  const count = Math.floor((parseFloat(e.target.value) || 0) / 100);
                                  setBills100(count.toString());
                                }}
                                className={'px-2 py-1 w-24 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right ' + (bills100Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0.00"
                              />
                            </div>
                            
                            {/* €50 */}
                            <div className="flex items-center gap-2">
                              <label className="text-cyan-200 text-sm w-16">€ 50</label>
                              <span className="text-cyan-300 text-sm">x</span>
                              <input
                                type="number"
                                min="0"
                                value={bills50}
                                onChange={(e) => {
                                  setBills50(e.target.value);
                                  setAmount50(((parseFloat(e.target.value) || 0) * 50).toFixed(2));
                                }}
                                className={'px-2 py-1 w-16 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center ' + (bills50Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0"
                              />
                              <span className="text-cyan-300 text-sm">=</span>
                              <span className="text-cyan-300 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount50}
                                onChange={(e) => {
                                  setAmount50(e.target.value);
                                  const count = Math.floor((parseFloat(e.target.value) || 0) / 50);
                                  setBills50(count.toString());
                                }}
                                className={'px-2 py-1 w-24 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right ' + (bills50Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0.00"
                              />
                            </div>
                            
                            {/* €20 */}
                            <div className="flex items-center gap-2">
                              <label className="text-cyan-200 text-sm w-16">€ 20</label>
                              <span className="text-cyan-300 text-sm">x</span>
                              <input
                                type="number"
                                min="0"
                                value={bills20}
                                onChange={(e) => {
                                  setBills20(e.target.value);
                                  setAmount20(((parseFloat(e.target.value) || 0) * 20).toFixed(2));
                                }}
                                className={'px-2 py-1 w-16 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center ' + (bills20Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0"
                              />
                              <span className="text-cyan-300 text-sm">=</span>
                              <span className="text-cyan-300 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount20}
                                onChange={(e) => {
                                  setAmount20(e.target.value);
                                  const count = Math.floor((parseFloat(e.target.value) || 0) / 20);
                                  setBills20(count.toString());
                                }}
                                className={'px-2 py-1 w-24 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right ' + (bills20Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0.00"
                              />
                            </div>
                            
                            {/* €10 */}
                            <div className="flex items-center gap-2">
                              <label className="text-cyan-200 text-sm w-16">€ 10</label>
                              <span className="text-cyan-300 text-sm">x</span>
                              <input
                                type="number"
                                min="0"
                                value={bills10}
                                onChange={(e) => {
                                  setBills10(e.target.value);
                                  setAmount10(((parseFloat(e.target.value) || 0) * 10).toFixed(2));
                                }}
                                className={'px-2 py-1 w-16 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center ' + (bills10Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0"
                              />
                              <span className="text-cyan-300 text-sm">=</span>
                              <span className="text-cyan-300 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount10}
                                onChange={(e) => {
                                  setAmount10(e.target.value);
                                  const count = Math.floor((parseFloat(e.target.value) || 0) / 10);
                                  setBills10(count.toString());
                                }}
                                className={'px-2 py-1 w-24 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right ' + (bills10Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0.00"
                              />
                            </div>
                            
                            {/* €5 */}
                            <div className="flex items-center gap-2">
                              <label className="text-cyan-200 text-sm w-16">€ 5</label>
                              <span className="text-cyan-300 text-sm">x</span>
                              <input
                                type="number"
                                min="0"
                                value={bills5}
                                onChange={(e) => {
                                  setBills5(e.target.value);
                                  setAmount5(((parseFloat(e.target.value) || 0) * 5).toFixed(2));
                                }}
                                className={'px-2 py-1 w-16 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center ' + (bills5Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0"
                              />
                              <span className="text-cyan-300 text-sm">=</span>
                              <span className="text-cyan-300 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount5}
                                onChange={(e) => {
                                  setAmount5(e.target.value);
                                  const count = Math.floor((parseFloat(e.target.value) || 0) / 5);
                                  setBills5(count.toString());
                                }}
                                className={'px-2 py-1 w-24 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right ' + (bills5Invalid ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                                placeholder="0.00"
                              />
                            </div>
                            
                            {/* Münzen */}
                            <div className="flex items-center gap-2">
                              <label className="text-cyan-200 text-sm w-16">Münzen</label>
                              <span className="text-cyan-300 text-sm invisible">x</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="4.99"
                                value={munzen}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  if (val <= 4.99) setMunzen(e.target.value);
                                }}
                                placeholder={calculatedMunzen >= 0 && calculatedMunzen <= 4.99 ? calculatedMunzen.toFixed(2) : '0.00'}
                                className={'px-2 py-1 w-24 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right ml-[60px] ' + (munzenInvalid || !safebagMatches ? 'border-red-500 bg-red-900/20' : 'border-cyan-300 dark:border-cyan-700')}
                              />
                              {munzenInvalid && <span className="text-red-400 text-xs">Max 4.99</span>}
                            </div>
                          </div>
                          
                          {/* Auto-calculate hint */}
                          {calculatedMunzen >= 0 && calculatedMunzen <= 4.99 && !munzen && (
                            <div className="text-xs text-amber-400 mt-2">
                              💡 Tipp: Münzen sollten €{calculatedMunzen.toFixed(2)} sein
                            </div>
                          )}
                          
                          {/* Total and validation */}
                          <div className="mt-4 pt-3 border-t border-cyan-400/30">
                            <div className="flex justify-between items-center">
                              <span className="text-cyan-200 font-medium">Safebag Gesamt:</span>
                              <span className={'text-xl font-bold ' + (safebagMatches ? 'text-green-400' : 'text-red-400')}>
                                €{safebagTotal.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-cyan-300 text-sm">Barumsatz (Soll):</span>
                              <span className="text-cyan-100 font-medium">€{totalCashSales.toFixed(2)}</span>
                            </div>
                            {!safebagMatches && (
                              <div className="mt-2 text-red-400 text-sm font-medium">
                                ⚠️ Differenz: €{(safebagTotal - totalCashSales).toFixed(2)}
                              </div>
                            )}
                            {safebagMatches && (
                              <div className="mt-2 text-green-400 text-sm font-medium">
                                ✓ Safebag stimmt überein
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
      
      {/* PDF Download Notification */}
      {pdfNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-purple-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-purple-400 flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">PDF Erstellt!</h4>
              <p className="text-sm text-purple-100 mb-2">
                Der Tagesreport wurde erfolgreich generiert.
              </p>
              <p className="text-xs text-purple-200 font-mono break-all bg-purple-700/50 px-2 py-1 rounded">
                {pdfNotification}
              </p>
              <p className="text-xs text-purple-100 mt-2">
                Die Datei wurde in Ihren Downloads-Ordner gespeichert.
              </p>
            </div>
            <button
              onClick={() => setPdfNotification(null)}
              className="text-purple-200 hover:text-white transition flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
