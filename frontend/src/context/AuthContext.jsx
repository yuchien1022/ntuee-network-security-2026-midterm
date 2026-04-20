import { createContext, useContext, useEffect, useState } from "react";
import api, { initCsrf } from "../services/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    initCsrf()
      .then(() =>
        api
          .get("/auth/me")
          .then(({ data }) => setUser(data.user))
          .catch(() => setUser(null))
      )
      .catch(() => setUser(null));
  }, []);

  function login(userData) {
    setUser(userData);
  }

  function logout() {
    setUser(null);
  }

  function updateUser(userData) {
    setUser(userData);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
