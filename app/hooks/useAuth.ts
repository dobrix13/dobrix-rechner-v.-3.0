import { useState, useEffect } from "react";
import type { UserSession } from "../types/models";
import { STORAGE_KEYS } from "../types/models";

const STORAGE_KEY = STORAGE_KEYS.USER_SESSION;

// Load user from localStorage
function loadUserFromStorage(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return null;
  }
}

// Save user to localStorage
function saveUserToStorage(user: UserSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore user session on mount
  useEffect(() => {
    const storedUser = loadUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsInitialized(true);
  }, []);

  // Show login popup if no user
  function updateLoginVisibility() {
    if (!user) setShowLogin(true);
    else setShowLogin(false);
  }

  // Handle login with API call
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", name, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();

      let organizationId = data.organizationId;
      let restaurantId = data.restaurantId;

      if (data.role === "kellner" && (!organizationId || !restaurantId)) {
        const userDetailsRes = await fetch(`/api/users/${name}`);
        if (userDetailsRes.ok) {
          const userDetails = await userDetailsRes.json();
          organizationId = userDetails.organizationId;
          restaurantId = userDetails.restaurantId;
        }
      }

      let organizationName = "";
      let restaurantName = "";

      if (data.role === "kellner" && organizationId && restaurantId) {
        const orgRes = await fetch(`/api/organizations/${organizationId}`);
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          organizationName = orgData.name || "";
        }
        const restListRes = await fetch(`/api/organizations/${organizationId}/restaurants`);
        if (restListRes.ok) {
          const restList = await restListRes.json();
          const userRestaurant = restList.find((r: any) => r._id === restaurantId);
          restaurantName = userRestaurant ? userRestaurant.name : "";
        }
      }

      const sessionUser: UserSession = {
        name: data.name,
        email: data.email,
        role: data.role,
        organisation: organizationName,
        restaurant: restaurantName,
        organizationId,
        restaurantId,
        userId: data._id,
        _id: data._id
      };
      
      setUser(sessionUser);
      saveUserToStorage(sessionUser);
      setShowLogin(false);
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      console.error("Login error:", err);
    }
  }

  function handleUserIconClick() {
    if (user) setShowUserMenu((prev) => !prev);
  }

  function handleLogout() {
    setUser(null);
    saveUserToStorage(null);
    setShowUserMenu(false);
  }

  return {
    user,
    setUser,
    showLogin,
    setShowLogin,
    isInitialized,
    showUserMenu,
    setShowUserMenu,
    handleLogin,
    handleUserIconClick,
    handleLogout,
    updateLoginVisibility,
  };
}
