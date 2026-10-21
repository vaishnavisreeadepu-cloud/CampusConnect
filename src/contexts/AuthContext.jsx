import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { initLocalStore } from "../services/storeManager";
import { INITIAL_USERS } from "../services/seedData";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure initial store is populated
    initLocalStore();

    const unsubscribe = authService.subscribeAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const loggedIn = await authService.login(email, password);
    setUser(loggedIn);
    return loggedIn;
  };

  const register = async (userData) => {
    const registeredUser = await authService.register(userData);
    setUser(registeredUser);
    return registeredUser;
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const loginWithGoogle = async (intendedRole = "student", extraData = {}) => {
    const loggedIn = await authService.loginWithGoogle(intendedRole, extraData);
    setUser(loggedIn);
    return loggedIn;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  /**
   * Helper for instant demo switching during functional review
   */
  const switchDemoRole = async (targetRole) => {
    const demoUser = INITIAL_USERS.find((u) => u.role === targetRole);
    if (demoUser) {
      return await login(demoUser.email, demoUser.password);
    }
  };

  const value = {
    user,
    loading,
    role: user?.role || null,
    isAdmin: user?.role === "admin",
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
    login,
    register,
    loginWithGoogle,
    resetPassword,
    logout,
    switchDemoRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
