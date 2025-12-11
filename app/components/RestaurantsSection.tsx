// RestaurantsSection: Handles restaurants tab UI and logic

import React, { useState } from "react";
import { useOrganizations } from "../hooks/useOrganizations";
import { useRestaurants } from "../hooks/useRestaurants";
import { Restaurant, Organization, User } from "../types/models";
import { SelectInput } from "./SelectInput";
import { apiPost, apiPatch } from "../utils/api";

interface RestaurantsSectionProps {
  user: User;
}

const RestaurantsSection: React.FC<RestaurantsSectionProps> = ({ user }) => {
  const organizations = useOrganizations() as Organization[];
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const restaurants = useRestaurants(selectedOrg, refresh) as Restaurant[];
  const [newRestName, setNewRestName] = useState<string>("");
  const [newRestFloat, setNewRestFloat] = useState<string>("");
  const [newRestTip, setNewRestTip] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [editRestId, setEditRestId] = useState<string | null>(null);
  const [editRestName, setEditRestName] = useState<string>("");
  const [editRestFloat, setEditRestFloat] = useState<string>("");
  const [editRestTip, setEditRestTip] = useState<string>("");

  async function handleCreateRestaurant(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !newRestName || !user?._id) return;
    setLoading(true);
    setError("");
    try {
      await apiPost(`/api/organizations/${selectedOrg}/restaurants?userId=${user._id}`, {
        name: newRestName,
        initialFloat: Number(newRestFloat),
        teamTipPercentage: Number(newRestTip)
      });
      setNewRestName("");
      setNewRestFloat("");
      setNewRestTip("");
      setRefresh(r => !r);
    } catch {
      setError("Fehler beim Erstellen des Restaurants");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(restId: string, orgId: string) {
    setLoading(true);
    setError("");
    try {
      await apiPatch(`/api/organizations/${orgId}/restaurants/${restId}?userId=${user._id}`, {
        name: editRestName,
        initialFloat: Number(editRestFloat),
        teamTipPercentage: Number(editRestTip)
      });
      setEditRestId(null);
      setRefresh(r => !r);
    } catch {
      setError("Fehler beim Speichern des Restaurants");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRestaurant(restId: string, orgId: string) {
    if (!window.confirm("Restaurant wirklich löschen?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/organizations/${orgId}/restaurants/${restId}?userId=${user._id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete failed");
      setRefresh(r => !r);
    } catch {
      setError("Fehler beim Löschen des Restaurants");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <SelectInput<Organization>
          label="Organisation wählen"
          value={selectedOrg}
          options={organizations}
          getOptionValue={org => org._id}
          getOptionLabel={org => org.name}
          onChange={setSelectedOrg}
          required
          className="border-cyan-400 focus:ring-cyan-500"
        />
      </div>
      {selectedOrg && (
        <>
          <hr className="w-full border-t border-cyan-700 mb-2 opacity-60" />
          <div className="w-full mb-4">
            <form
              className="flex flex-wrap gap-3 items-center w-full p-2 rounded-lg"
              style={{
                background: "repeating-linear-gradient(120deg, rgba(35,39,42,0.2) 0px, rgba(35,39,42,0.1) 24px, rgba(59,47,47,0.1) 24px, rgba(59,47,47,0.2) 48px)",
                boxShadow: "0 2px 12px 0 rgba(60, 40, 20, 0.18)",
                padding: "calc(var(--spacing, 4px) * 8)",
              }}
              onSubmit={handleCreateRestaurant}
            >
              <input
                type="text"
                value={newRestName}
                onChange={e => setNewRestName(e.target.value)}
                placeholder="Restaurant Name"
                className="flex-1 min-w-[120px] max-w-[320px] px-3 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-white text-base font-normal focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-cyan-400/60 transition-all duration-200"
                style={{ fontWeight: 400 }}
                required
              />
              <input
                type="number"
                value={newRestFloat}
                onChange={e => setNewRestFloat(e.target.value)}
                placeholder="Wechselgeld (€)"
                className="flex-1 min-w-[120px] max-w-[320px] px-3 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-white text-base font-normal focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-cyan-400/60 transition-all duration-200"
                style={{ fontWeight: 400 }}
                min={0}
                step={0.01}
              />
              <input
                type="number"
                value={newRestTip}
                onChange={e => setNewRestTip(e.target.value)}
                placeholder="TeamTip%"
                className="flex-1 min-w-[120px] max-w-[320px] px-3 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-white text-base font-normal focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-cyan-400/60 transition-all duration-200"
                style={{ fontWeight: 400 }}
                min={0}
                max={5}
                step={0.01}
              />
              <button
                type="submit"
                disabled={loading || !newRestName}
                className="flex-shrink-0 min-w-[120px] max-w-[200px] px-4 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold hover:bg-cyan-800/40 hover:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500 text-base transition-all duration-200"
                style={{ fontWeight: 600 }}
              >
                Neues Restaurant
              </button>
            </form>
          </div>
          <hr className="w-full border-t border-cyan-700 mt-2 opacity-60" />
          {error && <div className="text-red-400 mb-2">{error}</div>}
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              {restaurants.map((rest, idx) => {
                const orgId = typeof rest.organization === 'string' ? rest.organization : rest.organization?._id;
                const org = organizations.find(o => o._id === orgId);
                return (
                  <div key={rest._id || idx} className="border-2 border-cyan-400/30 bg-cyan-900/25 backdrop-blur-sm rounded-xl shadow-md p-4 flex flex-col gap-2 text-white hover:border-cyan-400/50 transition-all duration-200">
                    <div className="flex flex-col gap-1">
                      {editRestId === rest._id ? (
                        <input
                          type="text"
                          value={editRestName}
                          onChange={e => setEditRestName(e.target.value)}
                          className="font-bold text-lg truncate px-2 py-1 rounded border border-cyan-300/50 bg-cyan-900/40 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      ) : (
                        <span className="font-bold text-lg truncate">{rest.name}</span>
                      )}
                      <span className="text-xs text-cyan-200">{org ? org.name : '-'}</span>
                    </div>
                    <div className="flex flex-row gap-4 justify-between items-center mt-2">
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-cyan-300">Wechselgeld</span>
                        {editRestId === rest._id ? (
                          <input
                            type="number"
                            value={editRestFloat}
                            onChange={e => setEditRestFloat(e.target.value)}
                            className="font-mono text-base px-2 py-1 rounded border border-cyan-300/50 bg-cyan-900/40 backdrop-blur-sm text-white w-24 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <span className="font-mono text-base">{typeof rest.initialFloat === 'number' ? rest.initialFloat : 0} €</span>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-cyan-300">TeamTip%</span>
                        {editRestId === rest._id ? (
                          <input
                            type="number"
                            value={editRestTip}
                            onChange={e => setEditRestTip(e.target.value)}
                            className="font-mono text-base px-2 py-1 rounded border border-cyan-300/50 bg-cyan-900/40 backdrop-blur-sm text-white w-20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            step="0.01"
                            min="0"
                            max="5"
                          />
                        ) : (
                          <span className="font-mono text-base">{typeof rest.teamTipPercentage === 'number' ? rest.teamTipPercentage : 0}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      {editRestId === rest._id ? (
                        <>
                          <button
                            className="px-3 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold hover:bg-cyan-800/40 hover:border-cyan-400/60 text-xs transition-all duration-200"
                            style={{ fontSize: "0.95rem" }}
                            onClick={() => handleSaveEdit(rest._id, orgId || "")}
                            disabled={loading || !editRestName}
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold hover:bg-cyan-800/40 hover:border-cyan-400/60 text-xs transition-all duration-200"
                            style={{ fontSize: "0.95rem" }}
                            onClick={() => setEditRestId(null)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold hover:bg-cyan-800/40 hover:border-cyan-400/60 text-xs transition-all duration-200"
                            style={{ fontSize: "0.95rem" }}
                            onClick={() => {
                              setEditRestId(rest._id);
                              setEditRestName(rest.name);
                              setEditRestFloat(rest.initialFloat?.toString() || "0");
                              setEditRestTip(rest.teamTipPercentage?.toString() || "0");
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 rounded border-2 border-red-400/40 bg-red-900/30 backdrop-blur-sm text-red-100 font-bold hover:bg-red-800/40 hover:border-red-400/60 text-xs transition-all duration-200"
                            style={{ fontSize: "0.95rem" }}
                            onClick={() => handleDeleteRestaurant(rest._id, orgId || "")}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantsSection;
