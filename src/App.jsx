import { useState, useEffect } from "react";
import "./App.css";
import SignUp from "./signUp.jsx";
import Profile from "./Profile.jsx";
import Account from "./Account.jsx";
import CalendarApp from "./calander.jsx";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    const checkUserSession = () => {
      try {
        const storedUser = localStorage.getItem("reserveUser");
        const authToken = localStorage.getItem("authToken");

        if (storedUser && authToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user session:", error);
        // Clear invalid data
        localStorage.removeItem("reserveUser");
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Handle successful account creation/login
  const handleAccountCreated = () => {
    const storedUser = localStorage.getItem("reserveUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView("profile");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("reserveUser");
    localStorage.removeItem("authToken");
    setUser(null);
    setCurrentView("home");
  };

  // Navigation handler
  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading Reserve... ⏳</div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2 onClick={() => handleNavigation("home")}>Reserve</h2>
        </div>
        <div className="nav-links">
          <button
            className={currentView === "home" ? "active" : ""}
            onClick={() => handleNavigation("home")}
          >
            Home
          </button>
          {user ? (
            <>
              <button
                className={currentView === "calendar" ? "active" : ""}
                onClick={() => handleNavigation("calendar")}
              >
                Calendar
              </button>
              <button
                className={currentView === "profile" ? "active" : ""}
                onClick={() => handleNavigation("profile")}
              >
                Profile
              </button>
              <button
                className={currentView === "account" ? "active" : ""}
                onClick={() => handleNavigation("account")}
              >
                Account
              </button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button
              className={currentView === "signup" ? "active" : ""}
              onClick={() => handleNavigation("signup")}
            >
              Sign Up / Login
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {currentView === "home" && (
          <div className="home-container">
            <div className="home-content">
              <h1>Welcome to Reserve</h1>
              <p>Your personal appointment and event management system</p>

              <div className="actions">
                {user ? (
                  <div className="user-actions">
                    <p>Welcome Back 🫶🏼 , {user.firstName}!</p>
                    <button
                      className="btn primary"
                      onClick={() => handleNavigation("calendar")}
                    >
                      View Calendar
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => handleNavigation("profile")}
                    >
                      View Profile
                    </button>
                  </div>
                ) : (
                  <div className="auth-actions">
                    <button
                      className="btn primary"
                      onClick={() => handleNavigation("signup")}
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === "signup" && (
          <SignUp onAccountCreated={handleAccountCreated} />
        )}

        {currentView === "profile" && user && <Profile />}

        {currentView === "account" && user && <Account />}

        {currentView === "calendar" && user && <CalendarApp />}

        {/* Show signup if user tries to access protected routes without being logged in */}
        {(currentView === "profile" ||
          currentView === "account" ||
          currentView === "calendar") &&
          !user && (
            <div className="home-container">
              <div className="home-content">
                <h1>Authentication Required</h1>
                <p>Please sign up or log in to access this feature.</p>
                <div className="actions">
                  <button
                    className="btn primary"
                    onClick={() => handleNavigation("signup")}
                  >
                    Sign Up / Login
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}

export default App;
