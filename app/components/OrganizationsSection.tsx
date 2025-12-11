// OrganizationsSection: Handles organizations tab UI and logic

import React, { useEffect, useState } from "react";
import { useOrganizations } from "../hooks/useOrganizations";
import { Organization, User } from "../types/models";
import { apiGet, apiPost, apiPatch, apiDelete } from "../utils/api";

interface OrganizationsSectionProps {
  user: User;
}

const OrganizationsSection: React.FC<OrganizationsSectionProps> = ({ user }) => {
  const organizations = useOrganizations() as Organization[];
  const [newOrgName, setNewOrgName] = useState<string>("");
  const [newOrgOwner, setNewOrgOwner] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [orgs, setOrgs] = useState<Organization[]>(organizations);
  const [editOrgId, setEditOrgId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editOwner, setEditOwner] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  useEffect(() => {
    apiGet<Organization[]>("/api/organizations")
      .then(data => setOrgs(data));
  }, []);
  useEffect(() => {
    if (refresh) {
      apiGet<Organization[]>("/api/organizations")
        .then(data => setOrgs(data))
        .finally(() => setRefresh(false));
    }
  }, [refresh]);
  async function handleCreateOrg() {
    if (!newOrgName || !user?._id) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiPost<Organization>(`/api/organizations?userId=${user._id}`, { name: newOrgName, owner: newOrgOwner });
      setOrgs(prev => [...prev, data]);
      setNewOrgName("");
      setNewOrgOwner("");
    } catch (e: any) {
      setError("Fehler beim Erstellen der Organisation");
    } finally {
      setLoading(false);
    }
  }
  function getOwnerName(owner: any): string {
    if (!owner || typeof owner !== "string" || owner.trim() === "") return "-";
    return owner;
  }
  async function handleSaveEdit(orgId: string) {
    setLoading(true);
    setError("");
    try {
      await apiPatch(`/api/organizations/${orgId}?userId=${user._id}`, { name: editName, owner: editOwner });
      setRefresh(true);
      setEditOrgId(null);
    } catch (e: any) {
      setError("Fehler beim Speichern der Organisation");
    } finally {
      setLoading(false);
    }
  }
  async function handleDeleteOrg(orgId: string) {
    setLoading(true);
    setError("");
    try {
      await apiDelete(`/api/organizations/${orgId}?userId=${user._id}`);
      setRefresh(true);
    } catch (e: any) {
      setError("Fehler beim Löschen der Organisation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <hr className="w-full border-t border-cyan-700 mb-2 opacity-60" />
      <div className="w-full mb-4">
        <form
          className="flex flex-wrap gap-3 items-center w-full p-2 rounded-lg"
          style={{
            background: "repeating-linear-gradient(120deg, rgba(35,39,42,0.2) 0px, rgba(35,39,42,0.1) 24px, rgba(59,47,47,0.1) 24px, rgba(59,47,47,0.2) 48px)",
            boxShadow: "0 2px 12px 0 rgba(60, 40, 20, 0.18)",
            padding: "calc(var(--spacing, 4px) * 8)",
          }}
          onSubmit={e => { e.preventDefault(); handleCreateOrg(); }}
        >
          <input
            type="text"
            value={newOrgName}
            onChange={e => setNewOrgName(e.target.value)}
            placeholder="Neue Firma Name"
            className="flex-1 min-w-[120px] max-w-[320px] px-3 py-2 rounded-lg border border-cyan-400 bg-transparent text-white text-base font-normal focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            style={{ fontWeight: 400 }}
          />
          <input
            type="text"
            value={newOrgOwner}
            onChange={e => setNewOrgOwner(e.target.value)}
            placeholder="Owner"
            className="flex-1 min-w-[120px] max-w-[320px] px-3 py-2 rounded-lg border border-cyan-400 bg-transparent text-white text-base font-normal focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            style={{ fontWeight: 400 }}
          />
          <button
            type="submit"
            disabled={loading || !newOrgName}
            className="flex-shrink-0 min-w-[120px] max-w-[200px] px-4 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold hover:bg-cyan-800/40 hover:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500 text-base transition-all duration-200"
            style={{ fontWeight: 600 }}
          >
            Neue Firma
          </button>
        </form>
      </div>
      <hr className="w-full border-t border-cyan-700 mt-2 opacity-60" />
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-transparent text-white rounded shadow">
          <thead>
            <tr className="bg-transparent">
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Owner</th>
              <th className="px-3 py-2 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org, idx) => (
              <tr key={org._id || idx} className="border-b border-cyan-900">
                <td className="px-3 py-2">
                  {editOrgId === org._id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="px-2 py-1 rounded bg-cyan-900/30 backdrop-blur-sm text-white border border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    org.name
                  )}
                </td>
                <td className="px-3 py-2">
                  {editOrgId === org._id ? (
                    <input
                      type="text"
                      value={editOwner}
                      onChange={e => setEditOwner(e.target.value)}
                      className="px-2 py-1 rounded bg-cyan-900/30 backdrop-blur-sm text-white border border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    getOwnerName(org.owner)
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {editOrgId === org._id ? (
                    <>
                      <button
                        className="px-2 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold mr-2 hover:bg-cyan-800/40 hover:border-cyan-400/60 transition-all duration-200"
                        onClick={() => handleSaveEdit(org._id)}
                        disabled={loading}
                      >Speichern</button>
                      <button
                        className="px-2 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold hover:bg-cyan-800/40 hover:border-cyan-400/60 transition-all duration-200"
                        onClick={() => setEditOrgId(null)}
                        disabled={loading}
                      >Abbrechen</button>
                    </>
                  ) : (
                    <>
                      <button
                        className="px-2 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold mr-2 hover:bg-cyan-800/40 hover:border-cyan-400/60 transition-all duration-200"
                        onClick={() => {
                          setEditOrgId(org._id);
                          setEditName(org.name);
                          setEditOwner(org.owner || "");
                        }}
                        disabled={loading}
                      >Bearbeiten</button>
                      <button
                        className="px-2 py-1 rounded border-2 border-red-400/40 bg-red-900/30 backdrop-blur-sm text-red-100 font-bold hover:bg-red-800/40 hover:border-red-400/60 transition-all duration-200"
                        onClick={() => handleDeleteOrg(org._id)}
                        disabled={loading}
                      >Löschen</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationsSection;
