import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<{
    name: string;
    email?: string;
    role: string;
    organisation?: string;
    restaurant?: string;
    organizationId?: string;
    restaurantId?: string;
    userId?: string;
    _id?: string;
  } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

      setUser({
        name: data.name,
        email: data.email,
        role: data.role,
        organisation: organizationName,
        restaurant: restaurantName,
        organizationId,
        restaurantId,
        userId: data._id,
        _id: data._id
      });
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
    setShowUserMenu(false);
  }

  return {
    user,
    setUser,
    showLogin,
    setShowLogin,
    showUserMenu,
    setShowUserMenu,
    handleLogin,
    handleUserIconClick,
    handleLogout,
    updateLoginVisibility,
  };
}
