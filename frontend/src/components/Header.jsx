import React from "react";
import { Mail, BarChart3, RefreshCw, Zap, Home, Send } from "lucide-react";

const Header = ({ currentView, onViewChange, onFetchEmails, loading }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "email-sender", label: "Email Sender", icon: Send },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                AI Communication Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Intelligent Email Management System
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onFetchEmails}
              disabled={loading}
              className={`
                flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
                transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                ${loading ? "cursor-not-allowed" : ""}
              `}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>{loading ? "Fetching..." : "Fetch New Emails"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
