import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { User, Employee } from './types';
import { useData } from './data/DataContext';

export interface AuthContextType {
  user: (User | Employee) | null;
  login: (credential: string, password: string, rememberMe: boolean) => (User | Employee) | null;
  logout: () => void;
  updateCurrentUser: (updatedUser: User | Employee) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User | Employee) | null>(null);
  const data = useData(); 

  useEffect(() => {
    // This effect keeps the logged-in user's data in sync with the global state
    // For example, if an admin changes an employee's permissions, the employee's UI will update.
    if (user && data) {
      if (user.role === 'employee') {
        const freshEmployee = data.employees.find(e => e.id === user.id);
        // Using stringify for a simple deep comparison, might be slow for very large objects
        if (freshEmployee && JSON.stringify(freshEmployee) !== JSON.stringify(user)) {
            setUser(freshEmployee);
        } else if (!freshEmployee) { // If employee was deleted
            logout();
        }
      } else { // Admin or Subscriber
        const freshUser = data.users.find(u => u.id === user.id);
        if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(user)) {
            setUser(freshUser as User);
        } else if (!freshUser) { // If user was deleted
            logout();
        }
      }
    }
  }, [data?.users, data?.employees, user]);


  const login = (credential: string, password: string, rememberMe: boolean): (User | Employee) | null => {
    if (!data) return null;

    const allUsers = data.users;
    const allEmployees = data.employees;

    // Try finding a User (Admin/Subscriber) by phone
    const foundUser = allUsers.find(u => u.phone === credential && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      if (rememberMe) {
        localStorage.setItem('rememberedCredential', credential);
      } else {
        localStorage.removeItem('rememberedCredential');
      }
      return foundUser;
    }

    // Try finding an Employee by username
    const foundEmployee = allEmployees.find(e => e.username.toLowerCase() === credential.toLowerCase() && e.password === password);
    if (foundEmployee) {
        setUser(foundEmployee);
        if (rememberMe) {
          localStorage.setItem('rememberedCredential', credential);
        } else {
          localStorage.removeItem('rememberedCredential');
        }
        return foundEmployee;
    }

    return null;
  };
  
  const updateCurrentUser = (updatedUser: User | Employee) => {
    setUser(updatedUser);
    // Also update the global state in DataContext
    if (data && updatedUser.role !== 'employee') {
        data.updateUser(updatedUser as User);
    } else if (data && updatedUser.role === 'employee') {
        data.updateEmployee(updatedUser as Employee);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // The value is now created on every render, ensuring it always has the latest user state and functions.
  // This solves the stale closure issue with the login function.
  const value = { user, login, logout, updateCurrentUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};