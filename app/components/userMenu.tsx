import React from "react";

interface UserMenuProps {
  user: { name: string } | null;
  show: boolean;
  onLogout: () => void;
  onClose: () => void;
  onProfile: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, show, onLogout, onClose, onProfile }) => {
  if (!user || !show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(108, 43, 189, 0.15) 0%, rgba(0, 140, 140, 0.1) 50%, rgba(179, 106, 0, 0.15) 100%)'
      }}
    >
      <div className="relative rounded-2xl shadow-2xl p-8 flex flex-col gap-5 w-full max-w-md backdrop-blur-xl border border-white/10 z-10"
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
        <span className="relative text-2xl font-bold mb-3 text-center bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 30px rgba(108, 43, 189, 0.5), 0 0 60px rgba(0, 140, 140, 0.3)'
          }}
        >
          {user.name}
        </span>
        <button
          className="relative w-full py-3 rounded-lg text-white font-bold hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.7) 0%, rgba(239, 68, 68, 0.7) 100%)',
            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
          onClick={onLogout}
        >
          Logout
        </button>
        <button
          className="relative w-full py-3 rounded-lg text-white font-bold hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.7) 0%, rgba(40, 30, 50, 0.6) 100%)',
            boxShadow: '0 4px 20px rgba(108, 43, 189, 0.3), 0 0 40px rgba(0, 140, 140, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
          onClick={onProfile}
        >
          My Profile
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
