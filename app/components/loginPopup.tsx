import React from "react";

interface LoginPopupProps {
  show: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: string;
  loading?: boolean;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ show, onSubmit, error, loading }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(108, 43, 189, 0.15) 0%, rgba(0, 140, 140, 0.1) 50%, rgba(179, 106, 0, 0.15) 100%)'
      }}
    >
      <form
        className="relative rounded-2xl shadow-2xl p-10 flex flex-col gap-5 w-full max-w-md backdrop-blur-xl border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(28, 28, 28, 0.7) 0%, rgba(40, 40, 60, 0.6) 100%)',
          boxShadow: '0 8px 32px 0 rgba(108, 43, 189, 0.3), 0 0 60px rgba(0, 140, 140, 0.2), inset 0 0 80px rgba(179, 106, 0, 0.05)'
        }}
        onSubmit={onSubmit}
      >
        <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(108, 43, 189, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 140, 140, 0.4) 0%, transparent 50%)'
          }}
        />
        <h2 className="relative text-3xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 30px rgba(108, 43, 189, 0.5), 0 0 60px rgba(0, 140, 140, 0.3)'
          }}
        >
          Login
        </h2>
        <input
          name="name"
          type="text"
          required
          placeholder="Name"
          className="relative px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm border border-white/10"
          style={{
            background: 'rgba(20, 20, 40, 0.6)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(108, 43, 189, 0.1)'
          }}
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="relative px-4 py-3 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm border border-white/10"
          style={{
            background: 'rgba(20, 20, 40, 0.6)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 140, 140, 0.1)'
          }}
        />
        {error && (
          <div className="relative text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg py-2 px-3 backdrop-blur-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="relative mt-3 py-3 rounded-lg text-white font-bold hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 140, 140, 0.7) 0%, rgba(108, 43, 189, 0.7) 100%)',
            boxShadow: '0 4px 20px rgba(108, 43, 189, 0.4), 0 0 40px rgba(0, 140, 140, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Laden...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPopup;
