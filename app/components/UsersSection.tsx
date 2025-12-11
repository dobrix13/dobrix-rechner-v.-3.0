// UsersSection: Handles users tab UI and logic
import React, { useEffect, useState } from "react";
import { useOrganizations } from "../hooks/useOrganizations";
import { useRestaurants } from "../hooks/useRestaurants";
import { useUsers } from "../hooks/useUsers";
import { User, Organization, Restaurant } from "../types/models";
import { SelectInput } from "./SelectInput";
import { apiPost, apiPatch, apiDelete } from "../utils/api";

interface UsersSectionProps {
  user: User;
}

const UsersSection: React.FC<UsersSectionProps> = ({ user }) => {
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [editUserName, setEditUserName] = useState<string>("");
    const [editUserEmail, setEditUserEmail] = useState<string>("");
    const [editUserRole, setEditUserRole] = useState<User["role"] | "">("");
    const [editUserOrg, setEditUserOrg] = useState<string>("");
    const [editUserRest, setEditUserRest] = useState<string>("");
    const [userRefresh, setUserRefresh] = useState<boolean>(false);
    const users = useUsers("", "", userRefresh) as User[];
    const organizations = useOrganizations() as Organization[];
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    useEffect(() => {
      async function fetchAllRestaurants() {
        if (!organizations.length) return setAllRestaurants([]);
        const results = await Promise.all(
          organizations.map(org =>
            fetch(`/api/organizations/${org._id}/restaurants`).then(res => res.json())
          )
        );
        setAllRestaurants(results.flat());
      }
      fetchAllRestaurants();
    }, [organizations]);
    // Create a map for quick lookup
    const restaurantMap: { [key: string]: string } = {};
    allRestaurants.forEach(rest => { restaurantMap[rest._id] = rest.name; });
    const [selectedOrg, setSelectedOrg] = useState<string>("");
    const restaurants = useRestaurants(selectedOrg) as Restaurant[];
    const editRestaurants = useRestaurants(editUserOrg) as Restaurant[];
    const [selectedRest, setSelectedRest] = useState<string>("");
    const [newUserName, setNewUserName] = useState<string>("");
    const [newUserEmail, setNewUserEmail] = useState<string>("");
    const [newUserPassword, setNewUserPassword] = useState<string>("");
    const [newUserRole, setNewUserRole] = useState<User["role"] | "">("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    async function handleSaveEditUser(userId: string) {
      setLoading(true);
      setError("");
      try {
        const query = `?organizationId=${encodeURIComponent(editUserOrg)}&restaurantId=${encodeURIComponent(editUserRest)}`;
        await apiPatch(`/api/users${query}`, {
          _id: userId,
          name: editUserName,
          email: editUserEmail,
          role: editUserRole
        });
        setEditUserId(null);
        setUserRefresh(r => !r);
      } catch (e: any) {
        setError("Fehler beim Speichern des Benutzers");
      } finally {
        setLoading(false);
      }
    }

    async function handleDeleteUser(userId: string) {
      setLoading(true);
      setError("");
      try {
        await apiDelete(`/api/users?id=${encodeURIComponent(userId)}`);
        setUserRefresh(r => !r);
      } catch (e: any) {
        setError("Fehler beim Löschen des Benutzers");
      } finally {
        setLoading(false);
      }
    }

    async function handleCreateUser(e: React.FormEvent) {
      e.preventDefault();
      if (!newUserName || !newUserEmail || !newUserPassword || !selectedOrg || (!selectedRest && (newUserRole === "kellner" || newUserRole === "manager")) || !newUserRole) {
        console.log("Form validation failed", {
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          organizationId: selectedOrg,
          restaurantId: selectedRest,
          role: newUserRole
        });
        setError("Bitte alle Felder korrekt ausfüllen.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const payload = {
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          organizationId: selectedOrg,
          restaurantId: selectedRest,
          role: newUserRole
        };
        console.log("Submitting user payload", payload);
        const query = `?organizationId=${encodeURIComponent(selectedOrg)}&restaurantId=${encodeURIComponent(selectedRest)}`;
        await apiPost(`/api/users${query}`, payload);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserRole("");
        setSelectedOrg("");
        setSelectedRest("");
        setUserRefresh(r => !r);
      } catch (e: any) {
        setError("Fehler beim Erstellen des Benutzers: " + (e.message || e));
      } finally {
        setLoading(false);
      }
    }

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-2 text-cyan-200">Benutzern</h3>
      <form className="flex flex-wrap gap-3 items-center w-full p-2 rounded-lg mb-6"
        style={{ background: "rgba(30,40,60,0.25)", boxShadow: "0 2px 12px 0 rgba(60, 40, 20, 0.18)" }}
        onSubmit={handleCreateUser}
      >
        <SelectInput<{ value: User["role"], label: string }>
          label="Rolle wählen"
          value={newUserRole}
          options={[
            { value: "admin", label: "Admin" },
            { value: "org_admin", label: "Org Admin" },
            { value: "manager", label: "Manager" },
            { value: "kellner", label: "Kellner" },
          ]}
          getOptionValue={opt => opt.value}
          getOptionLabel={opt => opt.label}
          onChange={(val) => setNewUserRole(val as User["role"])}
          required
          className="min-w-[120px] max-w-[220px] border-cyan-400 focus:ring-cyan-500"
        />
        <SelectInput<Organization>
          label="Firma wählen"
          value={selectedOrg}
          options={organizations}
          getOptionValue={org => org._id}
          getOptionLabel={org => org.name}
          onChange={val => { setSelectedOrg(val); setSelectedRest(""); }}
          required
          className="min-w-[120px] max-w-[220px] border-cyan-400 focus:ring-cyan-500"
        />
        <SelectInput<Restaurant>
          label="Restaurant wählen"
          value={selectedRest}
          options={restaurants}
          getOptionValue={rest => rest._id}
          getOptionLabel={rest => rest.name}
          onChange={setSelectedRest}
          required
          disabled={!selectedOrg}
          className="min-w-[120px] max-w-[220px] border-cyan-400 focus:ring-cyan-500"
        />
        <input
          type="text"
          value={newUserName}
          onChange={e => setNewUserName(e.target.value)}
          placeholder="Benutzername"
          className="min-w-[120px] max-w-[220px] px-3 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-white hover:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          required
        />
        <input
          type="email"
          value={newUserEmail}
          onChange={e => setNewUserEmail(e.target.value)}
          placeholder="Email"
          className="min-w-[120px] max-w-[220px] px-3 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-white hover:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          required
        />
        <input
          type="password"
          value={newUserPassword}
          onChange={e => setNewUserPassword(e.target.value)}
          placeholder="Passwort"
          className="min-w-[120px] max-w-[220px] px-3 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-white hover:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="min-w-[120px] max-w-[200px] px-4 py-2 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-bold hover:bg-cyan-800/40 hover:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500 text-base transition-all duration-200"
        >
          Benutzer anlegen
        </button>
      </form>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-transparent text-white rounded shadow table-fixed sm:table-auto">
          <thead>
            <tr className="bg-transparent">
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Rolle</th>
              <th className="px-3 py-2 text-left">Organisation</th>
              <th className="px-3 py-2 text-left">Restaurant</th>
              <th className="px-3 py-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u._id || idx} className="border-b border-cyan-900">
                <td className="px-3 py-2">
                  {editUserId === u._id ? (
                    <input
                      type="text"
                      className="bg-cyan-900/30 backdrop-blur-sm border border-cyan-400/30 text-white px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      value={editUserName}
                      onChange={e => setEditUserName(e.target.value)}
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td className="px-3 py-2">
                  {editUserId === u._id ? (
                    <input
                      type="email"
                      className="bg-cyan-900/30 backdrop-blur-sm border border-cyan-400/30 text-white px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      value={editUserEmail}
                      onChange={e => setEditUserEmail(e.target.value)}
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="px-3 py-2">
                  {editUserId === u._id ? (
                    <select
                      className="bg-cyan-900/30 backdrop-blur-sm border border-cyan-400/30 text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full"
                      value={editUserRole}
                      onChange={e => setEditUserRole(e.target.value as User["role"])}
                    >
                      <option value="admin">Admin</option>
                      <option value="org_admin">Org Admin</option>
                      <option value="manager">Manager</option>
                      <option value="kellner">Kellner</option>
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td className="px-3 py-2">
                  {editUserId === u._id ? (
                    <select
                      className="bg-gray-800 text-white px-2 py-1 rounded"
                      value={editUserOrg}
                      onChange={e => { setEditUserOrg(e.target.value); setEditUserRest(""); }}
                    >
                      <option value="">-- Wählen --</option>
                      {organizations.map(org => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                  ) : (
                    typeof u.organization === 'string' ? u.organization : (u.organization?.name || '-')
                  )}
                </td>
                <td className="px-3 py-2">
                  {editUserId === u._id ? (
                    <select
                      className="bg-gray-800 text-white px-2 py-1 rounded"
                      value={editUserRest}
                      onChange={e => setEditUserRest(e.target.value)}
                      disabled={!editUserOrg}
                    >
                      <option value="">-- Wählen --</option>
                      {editRestaurants.map(rest => (
                        <option key={rest._id} value={rest._id}>{rest.name}</option>
                      ))}
                    </select>
                  ) : (
                    typeof u.restaurant === 'string' ? u.restaurant : (u.restaurant?.name || '-')
                  )}
                </td>
                <td className="px-3 py-2 flex gap-2 justify-end">
                  {editUserId === u._id ? (
                    <>
                      <button className="px-2 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-normal hover:bg-cyan-800/40 hover:border-cyan-400/60 text-xs transition-all duration-200" onClick={() => handleSaveEditUser(u._id)} disabled={loading}>Save</button>
                      <button className="px-2 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-normal hover:bg-cyan-800/40 hover:border-cyan-400/60 text-xs transition-all duration-200" onClick={() => setEditUserId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="px-2 py-1 rounded border-2 border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm text-cyan-100 font-normal hover:bg-cyan-800/40 hover:border-cyan-400/60 text-xs transition-all duration-200" onClick={() => {
                        setEditUserId(u._id);
                        setEditUserName(u.name);
                        setEditUserEmail(u.email);
                        setEditUserRole(u.role);
                        setEditUserOrg(typeof u.organization === 'string' ? u.organization : (u.organization?._id || ""));
                        setEditUserRest(typeof u.restaurant === 'string' ? u.restaurant : (u.restaurant?._id || ""));
                      }}>Edit</button>
                      <button className="px-2 py-1 rounded border-2 border-red-400/40 bg-red-900/30 backdrop-blur-sm text-red-100 font-normal hover:bg-red-800/40 hover:border-red-400/60 text-xs transition-all duration-200" onClick={() => handleDeleteUser(u._id)} disabled={loading}>Delete</button>
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

export default UsersSection;
