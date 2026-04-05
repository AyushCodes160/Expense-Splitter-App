import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Interceptor to handle global 401 Unauthorized errors (e.g. expired tokens)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  setToken: (token: string | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("authToken", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      fetchUser();
    } else {
      localStorage.removeItem("authToken");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/users/me");
      setUser(res.data);
    } catch (e) {
      console.error("Failed to fetch user", e);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          setToken(null); // expired
          setLoading(false);
        } else {
          setTokenState(storedToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          fetchUser();
        }
      } catch (e) {
        setToken(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  function signOut() {
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, setToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
