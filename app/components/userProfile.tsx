import React, { useState } from "react";
import { User } from "../types/models";

interface UserProfileProps {
  user: User;
  show: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<User>) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, show, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name || "");
  const [editEmail, setEditEmail] = useState(user.email || "");
  const [editPassword, setEditPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!show) return null;

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!editName.trim()) {
      setError("Name darf nicht leer sein");
      return;
    }

    if (!editEmail.trim() || !editEmail.includes("@")) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein");
      return;
    }

    if (editPassword && editPassword !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setLoading(true);

    try {
      if (!user._id) {
        throw new Error("Benutzer-ID fehlt");
      }

      const updateData: any = {
        _id: user._id,
        name: editName,
        email: editEmail,
      };

      if (editPassword) {
        updateData.password = editPassword;
      }

      console.log("Sending update data:", updateData);

      const res = await fetch(`/api/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorMessage = "Fehler beim Aktualisieren";
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const updatedUser = await res.json();
      onUpdate(updatedUser);
      setSuccess("Profil erfolgreich aktualisiert!");
      setIsEditing(false);
      setEditPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Fehler beim Aktualisieren des Profils");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(108, 43, 189, 0.15) 0%, rgba(0, 140, 140, 0.1) 50%, rgba(179, 106, 0, 0.15) 100%)'
      }}
    >
      <div className="relative rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col gap-4 sm:gap-5 w-full max-w-sm sm:max-w-md backdrop-blur-xl border border-white/10 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(28, 28, 28, 0.7) 0%, rgba(40, 40, 60, 0.6) 100%)',
          boxShadow: '0 8px 32px 0 rgba(108, 43, 189, 0.3), 0 0 60px rgba(0, 140, 140, 0.2), inset 0 0 80px rgba(179, 106, 0, 0.05)'
        }}
      >
        <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(108, 43, 189, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 140, 140, 0.4) 0%, transparent 50%)'
          }}
        />
        
        <h2 className="relative text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-4 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 30px rgba(108, 43, 189, 0.5), 0 0 60px rgba(0, 140, 140, 0.3)'
          }}
        >
          Mein Profil
        </h2>

        {error && (
          <div className="relative text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg py-2 px-3 backdrop-blur-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="relative text-green-400 text-sm text-center bg-green-900/20 border border-green-500/30 rounded-lg py-2 px-3 backdrop-blur-sm">
            {success}
          </div>
        )}

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/80 text-sm font-semibold">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm border border-white/10 text-sm sm:text-base"
                style={{
                  background: 'rgba(20, 20, 40, 0.6)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(108, 43, 189, 0.1)'
                }}
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white backdrop-blur-sm border border-white/10 text-sm sm:text-base"
                style={{
                  background: 'rgba(20, 20, 40, 0.4)',
                }}
              >
                {user.name}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/80 text-sm font-semibold">E-Mail</label>
            {isEditing ? (
              <input
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm border border-white/10 text-sm sm:text-base"
                style={{
                  background: 'rgba(20, 20, 40, 0.6)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 140, 140, 0.1)'
                }}
              />
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white backdrop-blur-sm border border-white/10 text-sm sm:text-base"
                style={{
                  background: 'rgba(20, 20, 40, 0.4)',
                }}
              >
                {user.email}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/80 text-sm font-semibold">Rolle</label>
            <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white/60 backdrop-blur-sm border border-white/10 text-sm sm:text-base"
              style={{
                background: 'rgba(20, 20, 40, 0.4)',
              }}
            >
              {user.role}
            </div>
          </div>

          {isEditing && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-white/80 text-sm font-semibold">Neues Passwort (optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  placeholder="Leer lassen, um nicht zu ändern"
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm border border-white/10 text-sm sm:text-base"
                  style={{
                    background: 'rgba(20, 20, 40, 0.6)',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(179, 106, 0, 0.1)'
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/80 text-sm font-semibold">Passwort bestätigen</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Neues Passwort bestätigen"
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm border border-white/10 text-sm sm:text-base"
                  style={{
                    background: 'rgba(20, 20, 40, 0.6)',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(179, 106, 0, 0.1)'
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="relative flex flex-col sm:flex-row gap-3 mt-4">
          {isEditing ? (
            <>
              <button
                className="flex-1 py-2 sm:py-3 rounded-lg text-white font-bold hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm text-sm sm:text-base"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 140, 140, 0.7) 0%, rgba(108, 43, 189, 0.7) 100%)',
                  boxShadow: '0 4px 20px rgba(108, 43, 189, 0.4), 0 0 40px rgba(0, 140, 140, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Speichern..." : "Speichern"}
              </button>
              <button
                className="flex-1 py-2 sm:py-3 rounded-lg text-white font-bold hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm text-sm sm:text-base"
                style={{
                  background: 'linear-gradient(135deg, rgba(100, 100, 120, 0.7) 0%, rgba(80, 80, 100, 0.6) 100%)',
                  boxShadow: '0 4px 20px rgba(100, 100, 120, 0.3), 0 0 40px rgba(80, 80, 100, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
                onClick={handleCancel}
                disabled={loading}
              >
                Abbrechen
              </button>
            </>
          ) : (
            <>
              <button
                className="flex-1 py-2 sm:py-3 rounded-lg text-white font-bold hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm text-sm sm:text-base"
                style={{
                  background: 'linear-gradient(135deg, rgba(179, 106, 0, 0.7) 0%, rgba(217, 119, 6, 0.7) 100%)',
                  boxShadow: '0 4px 20px rgba(179, 106, 0, 0.4), 0 0 40px rgba(217, 119, 6, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
                onClick={() => setIsEditing(true)}
              >
                Bearbeiten
              </button>
              <button
                className="flex-1 py-2 sm:py-3 rounded-lg text-white font-bold hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm text-sm sm:text-base"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.7) 0%, rgba(40, 30, 50, 0.6) 100%)',
                  boxShadow: '0 4px 20px rgba(108, 43, 189, 0.3), 0 0 40px rgba(0, 140, 140, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
                onClick={onClose}
              >
                Schließen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
