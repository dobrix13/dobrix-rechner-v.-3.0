// AbrechnungenSection: Handles abrechnungen tab UI and logic
import React, { useState } from "react";
import { Abrechnung, User, Organization, Restaurant } from "../types/models";
import { SelectInput } from "./SelectInput";
import { useOrganizations } from "../hooks/useOrganizations";
import { useRestaurants } from "../hooks/useRestaurants";
import { useUsers } from "../hooks/useUsers";
import { useAbrechnungen } from "../hooks/useAbrechnungen";

interface AbrechnungenSectionProps {
  user: User;
  filterByRestaurant?: string; // Optional: restrict to specific restaurant (for managers)
}

const AbrechnungenSection: React.FC<AbrechnungenSectionProps> = ({ user, filterByRestaurant }) => {
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedRest, setSelectedRest] = useState<string>(filterByRestaurant || "");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [refresh, setRefresh] = useState<number>(0);
  const { organizations } = useOrganizations();
  const { restaurants: allRestaurants } = useRestaurants("");
  const { restaurants } = useRestaurants(selectedOrg);
  const { users: allUsers } = useUsers("", "", refresh);
  const { users } = useUsers(selectedOrg, selectedRest, refresh);
  const { abrechnungen: rawAbrechnungen } = useAbrechnungen({
    restaurantId: selectedRest,
    refresh
  });
  const abrechnungen = rawAbrechnungen.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB; // ascending order
  });

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Abrechnung>>({});

  // Start editing
  const handleEdit = (abrechnung: Abrechnung) => {
    if (editingId === abrechnung._id) {
      // If already editing this row, do nothing
      return;
    }
    setEditingId(abrechnung._id);
    setEditData({ ...abrechnung });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  // Save changes
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
        setRefresh(r => r + 1);
      } else {
        const error = await res.json();
        alert(error.error || "Fehler beim Speichern");
      }
    } catch (err: any) {
      alert("Fehler beim Speichern");
    }
  };

  // Delete handler
  const handleDelete = async (abrechnungId: string) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/abrechnungen/${abrechnungId}?userId=${user._id}`, { method: "DELETE" });
      if (res.ok) {
        setRefresh(r => r + 1); // trigger refresh
      } else {
        const error = await res.json();
        alert(error.error || "Fehler beim Löschen");
      }
    } catch (err: any) {
      alert("Fehler beim Löschen");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {!filterByRestaurant && (
          <>
            <SelectInput<Organization>
              label="Alle Firmen"
              value={selectedOrg}
              options={organizations}
              getOptionValue={org => org._id}
              getOptionLabel={org => org.name}
              onChange={val => { setSelectedOrg(val); setSelectedRest(""); }}
              className="min-w-[120px] max-w-[220px] border-cyan-400 focus:ring-cyan-500"
            />
            <SelectInput<Restaurant>
              label="Alle Restaurants"
              value={selectedRest}
              options={restaurants}
              getOptionValue={rest => rest._id}
              getOptionLabel={rest => rest.name}
              onChange={setSelectedRest}
              disabled={!selectedOrg}
              className="min-w-[120px] max-w-[220px] border-cyan-400 focus:ring-cyan-500"
            />
          </>
        )}
        <SelectInput<User>
          label="Alle Benutzer"
          value={selectedUser}
          options={users}
          getOptionValue={u => u._id}
          getOptionLabel={u => u.name}
          onChange={setSelectedUser}
          className="min-w-[120px] max-w-[220px] border-cyan-400 focus:ring-cyan-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-transparent text-white rounded shadow text-xs">
          <thead>
            <tr className="bg-transparent">
              <th className="px-2 py-1.5 text-left text-xs">Datum/Zeit</th>
              <th className="px-2 py-1.5 text-left text-xs">Name</th>
              <th className="px-2 py-1.5 text-left text-xs">Umsatz</th>
              <th className="px-2 py-1.5 text-left text-xs">TeamTip</th>
              <th className="px-2 py-1.5 text-left text-xs">Bargeld</th>
            </tr>
          </thead>
          <tbody>
            {abrechnungen.map((ab, idx) => {
              const userObj = allUsers.find(u => u._id === ab.userId);
              const isEditing = editingId === ab._id;
              // Calculate live team tip amount for edit row
              let liveTeamTip = ab.teamTipsPaid;
              if (isEditing) {
                const restaurantObjEdit = allRestaurants.find(r => r._id === (editData.restaurant || ab.restaurant));
                const teamTipPercentage = restaurantObjEdit?.teamTipPercentage || 0;
                const totalSalesEdit = editData.totalSales ?? ab.totalSales ?? 0;
                liveTeamTip = Number(((totalSalesEdit * teamTipPercentage) / 100).toFixed(2));
              }
              return (
                <tr 
                  key={ab._id || idx} 
                  onClick={() => handleEdit(ab)}
                  className={`border-b border-cyan-900/30 cursor-pointer transition ${
                    isEditing 
                      ? 'bg-cyan-500/20 ring-2 ring-cyan-400/50' 
                      : 'hover:bg-cyan-900/20'
                  }`}
                >
                  <td className="px-2 py-1.5 text-xs">{ab.date ? new Date(ab.date).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : '-'}</td>
                  <td className="px-2 py-1.5 text-xs">
                    {isEditing ? (
                      <select
                        className="bg-cyan-900/30 backdrop-blur-sm border border-cyan-400/30 text-white px-1.5 py-1 rounded text-xs w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={editData.userId as string}
                        onChange={e => setEditData(ed => ({ ...ed, userId: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                      >
                        {allUsers.map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    ) : (
                      userObj?.name || '-'
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-xs">
                    {isEditing ? (
                      <input
                        type="number"
                        className="bg-cyan-900/30 backdrop-blur-sm border border-cyan-400/30 text-white px-1.5 py-1 rounded text-xs w-20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={editData.totalSales ?? ''}
                        onChange={e => setEditData(ed => ({ ...ed, totalSales: Number(e.target.value) }))}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      ab.totalSales?.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) || '-'
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-xs">
                    {isEditing
                      ? liveTeamTip?.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                      : ab.teamTipsPaid?.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) || '-'}
                  </td>
                  <td className="px-2 py-1.5 text-xs">
                    {isEditing ? (
                      <input
                        type="number"
                        className="bg-cyan-900/30 backdrop-blur-sm border border-cyan-400/30 text-white px-1.5 py-1 rounded text-xs w-20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={editData.salesInCash ?? ''}
                        onChange={e => setEditData(ed => ({ ...ed, salesInCash: Number(e.target.value) }))}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      ab.salesInCash?.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) || '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {editingId && (
          <div className="flex justify-end gap-2 mt-3">
            <button 
              className="px-4 py-2 border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm hover:bg-cyan-800/40 hover:border-cyan-400/60 rounded-lg text-sm font-medium transition-all duration-200 text-cyan-100" 
              onClick={handleSave}
            >
              ✓ Speichern
            </button>
            <button 
              className="px-4 py-2 border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm hover:bg-cyan-800/40 hover:border-cyan-400/60 rounded-lg text-sm font-medium transition-all duration-200 text-cyan-100" 
              onClick={handleCancel}
            >
              ✕ Abbrechen
            </button>
            <button 
              className="px-4 py-2 border-2 border-red-400/40 bg-red-900/30 backdrop-blur-sm hover:bg-red-800/40 hover:border-red-400/60 rounded-lg text-sm font-medium transition-all duration-200 text-red-100" 
              onClick={() => handleDelete(editingId)}
            >
              🗑 Löschen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbrechnungenSection;
