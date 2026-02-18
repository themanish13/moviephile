import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  email: string;
  badges: string[];
  stats: {
    watchlist: number;
    watched: number;
    reviews: number;
    followers: number;
    following: number;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Demo user for any login
    if (email && password) {
      const newUser: User = {
        name: "Alex Rivera",
        username: "@alexcinema",
        avatar: "AR",
        bio: "Film enthusiast | Sci-fi addict | Always watching something",
        email: email,
        badges: ["Top Reviewer", "Movie Buff", "Sci-Fi Expert"],
        stats: {
          watchlist: 47,
          watched: 312,
          reviews: 89,
          followers: 1240,
          following: 356,
        },
      };
      setUser(newUser);
      localStorage.setItem("moviephile_user", JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("moviephile_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

