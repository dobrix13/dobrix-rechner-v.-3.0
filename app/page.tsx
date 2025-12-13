"use client";

import { useEffect, useState } from "react";
// Removed unused animejs import
import Header from "./components/header";
import LoginPopup from "./components/loginPopup";
import UserMenu from "./components/userMenu";
import UserProfile from "./components/userProfile";
import CallToActionBlock from "./components/callToActionBlock";
import AbrechnungForm from "./components/abrechnungForm";
import AdminDashboard from "./components/adminDashboard";
import ManagerDashboard from "./components/managerDashboard";
import WaiterStatistik from "./components/waiterStatistik";
import ROLE_COLORS from "./utils/roleColors";
import { getDateInfo } from "./utils/getDateInfo";
import { useAuth } from "./hooks/useAuth";

export default function Home() {
  const [showUserProfile, setShowUserProfile] = useState(false);
  const {
    user,
    setUser,
    showLogin,
    setShowLogin,
    showUserMenu,
    setShowUserMenu,
    handleLogin,
    handleUserIconClick,
    handleLogout,
    isInitialized,
  } = useAuth();
  const glowColor =
    user?.role === "admin"
      ? ROLE_COLORS.admin
      : user?.role === "kellner"
      ? ROLE_COLORS.kellner
      : user?.role === "manager"
      ? ROLE_COLORS.manager
      : ROLE_COLORS.none;
  const [showAbrechnungForm, setShowAbrechnungForm] = useState(false);
  const [existingAbrechnungData, setExistingAbrechnungData] = useState<any>(null);
  const [showStatistik, setShowStatistik] = useState(false);
  useEffect(() => {
    console.log("showAbrechnungForm state:", showAbrechnungForm);
  }, [showAbrechnungForm]);
  const { dayName, date, time } = getDateInfo();

  useEffect(() => {
    if (isInitialized && !user) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [user, isInitialized, setShowLogin]);

  // Show loading state while initializing session
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <style jsx global>{`
        body {
          background:
            repeating-linear-gradient(120deg, #a259ff22 0px, #a259ff22 60px, transparent 60px, transparent 120px),
            repeating-linear-gradient(60deg, #00fff722 0px, #00fff722 60px, transparent 60px, transparent 120px),
            repeating-linear-gradient(0deg, #ff990022 0px, #ff990022 60px, transparent 60px, transparent 120px),
            radial-gradient(circle at 20% 30%, #024f4cff 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, #3a1f5eff 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, #4a2e04ff 0%, transparent 70%);
          background-size: 120px 120px, 120px 120px, 120px 120px, cover, cover, cover;
          background-blend-mode: lighten, lighten, lighten, screen, screen, screen;
        }
      `}</style>
      {/* Header */}
      <Header
        glowColor={glowColor}
        onUserIconClick={handleUserIconClick}
        user={user}
      />
      {/* Login Popup */}
      <LoginPopup
        show={showLogin}
        onSubmit={handleLogin}
      />
      {/* Main */}
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-between pt-0 pb-32 px-0 sm:px-4 sm:items-start mx-auto">
        {user?.role === "admin" && <AdminDashboard user={user} />}
        {user?.role === "manager" && user._id && <ManagerDashboard user={{ ...user, _id: user._id }} />}
        {user?.role === "kellner" && !showAbrechnungForm && !showStatistik && (
          <CallToActionBlock
            user={user}
            dayName={dayName}
            date={date}
            time={time}
            onAbrechnungClick={(existingData) => {
              console.log("CallToActionBlock clicked, setting showAbrechnungForm to true");
              setExistingAbrechnungData(existingData || null);
              setShowAbrechnungForm(true);
            }}
            onStatistikClick={() => setShowStatistik(true)}
          />
        )}
        {user?.role === "kellner" && showAbrechnungForm && user.restaurantId && user.organizationId && (
          <AbrechnungForm
            user={user}
            restaurantId={user.restaurantId}
            orgId={user.organizationId}
            onClose={() => {
              setShowAbrechnungForm(false);
              setExistingAbrechnungData(null);
            }}
            existingAbrechnung={existingAbrechnungData}
          />
        )}
        {user?.role === "kellner" && showStatistik && (
          <WaiterStatistik
            user={user}
            onClose={() => setShowStatistik(false)}
          />
        )}
      </main>
      {/* Footer present, rain animation sliders removed for modularity */}
      <footer className="w-full flex flex-col items-center py-6 bg-transparent z-20"></footer>
      <UserMenu
        user={user}
        show={showUserMenu}
        onLogout={handleLogout}
        onClose={() => setShowUserMenu(false)}
        onProfile={() => {
          setShowUserMenu(false);
          setShowUserProfile(true);
        }}
      />
      {user && user._id && (
        <UserProfile
          user={user as any}
          show={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          onUpdate={(updatedUser: any) => {
            setUser({ ...user, ...updatedUser });
          }}
        />
      )}
    </div>
  );
}
