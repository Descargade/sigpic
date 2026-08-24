import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  username: string;
  nombre: string;
  cargo: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const VALID_CREDENTIALS: Record<string, { password: string; nombre: string; cargo: string }> = {
  dgonzalezcarreras: {
    password: 'GCdla020403',
    nombre: 'D. Gonzalez Carreras',
    cargo: 'Administrador',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sigpic-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback((username: string, password: string): boolean => {
    const cred = VALID_CREDENTIALS[username.toLowerCase()];
    if (cred && cred.password === password) {
      setUser({ username: username.toLowerCase(), nombre: cred.nombre, cargo: cred.cargo });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
