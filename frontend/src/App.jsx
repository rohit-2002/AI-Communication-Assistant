import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import EmailList from "./components/EmailList";
import EmailDetail from "./components/EmailDetail";
import Analytics from "./components/Analytics";
import EmailSender from "./components/EmailSender";
import { emailService, statsService } from "./services/api";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    priority: "",
    sentiment: "",
    status: "",
    category: "",
  });

  // Load initial data
  useEffect(() => {
    loadEmails();
    loadStats();
  }, []);

  // Load emails with current filters
  useEffect(() => {
    loadEmails();
  }, [filters]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await emailService.getEmails(filters);
      setEmails(response.data.data || []);
    } catch (error) {
      console.error("Error loading emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log("Loading stats with statsService:", statsService);
      const response = await statsService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Error loading stats:", error);
      console.error("statsService:", statsService);
    }
  };

  const handleFetchEmails = async () => {
    try {
      setLoading(true);
      await emailService.fetchEmails();
      await loadEmails();
      await loadStats();
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
    setCurrentView("email-detail");
  };

  const handleEmailUpdate = async (emailId, updates) => {
    try {
      await emailService.updateEmailStatus(emailId, updates.status);
      await loadEmails();
      await loadStats();

      // Update selected email if it's the one being updated
      if (selectedEmail && selectedEmail._id === emailId) {
        setSelectedEmail({ ...selectedEmail, ...updates });
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  const handleGenerateResponse = async (emailId) => {
    try {
      const response = await emailService.generateResponse(emailId);

      // Update the email in the list
      setEmails(
        emails.map((email) =>
          email._id === emailId
            ? { ...email, aiResponse: response.data.data.aiResponse }
            : email
        )
      );

      // Update selected email if it's the one being updated
      if (selectedEmail && selectedEmail._id === emailId) {
        setSelectedEmail({
          ...selectedEmail,
          aiResponse: response.data.data.aiResponse,
        });
      }

      return response.data.data.aiResponse;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            stats={stats}
            emails={emails}
            onEmailSelect={handleEmailSelect}
            onFetchEmails={handleFetchEmails}
            loading={loading}
          />
        );
      case "emails":
        return (
          <EmailList
            emails={emails}
            onEmailSelect={handleEmailSelect}
            onEmailUpdate={handleEmailUpdate}
            onGenerateResponse={handleGenerateResponse}
            filters={filters}
            onFiltersChange={setFilters}
            loading={loading}
          />
        );
      case "email-detail":
        return (
          <EmailDetail
            email={selectedEmail}
            onBack={() => setCurrentView("emails")}
            onEmailUpdate={handleEmailUpdate}
            onGenerateResponse={handleGenerateResponse}
          />
        );
      case "analytics":
        return <Analytics stats={stats} emails={emails} />;
      case "email-sender":
        return (
          <EmailSender
            emails={emails}
            onRefresh={() => {
              loadEmails();
              loadStats();
            }}
          />
        );
      default:
        return (
          <Dashboard
            stats={stats}
            emails={emails}
            onEmailSelect={handleEmailSelect}
            onFetchEmails={handleFetchEmails}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onFetchEmails={handleFetchEmails}
        loading={loading}
      />

      <main className="container mx-auto px-4 py-6">{renderCurrentView()}</main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#4aed88",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
