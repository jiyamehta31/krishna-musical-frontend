import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

const WHATSAPP_PRIMARY = "918829906454";

const CATEGORIES = [
  { name: "All Instruments", path: "/products" },
  { name: "Harmoniums", path: "/products?category=Harmonium" },
  { name: "Classical Sitars", path: "/products?category=Sitar" },
  { name: "Tabla Sets", path: "/products?category=Tabla" },
  { name: "Tanpuras", path: "/products?category=Tanpura" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  // 1. Reset menu states during render when the route changes (React-recommended pattern)
  const currentPath = location.pathname + location.search;
  const [prevPath, setPrevPath] = useState(currentPath);

  if (currentPath !== prevPath) {
    setPrevPath(currentPath);
    setMenuOpen(false);
    setDropdownOpen(false);
  }

  // 2. Derive user session directly during render — no useState or useEffect required
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!stored || !token || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch (err) {
      console.error("Error reading session in Navbar:", err);
      return null;
    }
  };

  const user = getStoredUser();

  const whatsappUrl = `https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent(
    "Hello Krishna Musicals, I am reaching out from your website with an enquiry.",
  )}`;

  return (
    <>
      {/* =========================
          TOP INFORMATION BAR
      ========================= */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-item">
            <span className="top-icon">📍</span>
            <span>Gandhi Murti, Pali, Rajasthan, India</span>
          </div>

          <div className="top-item">
            <span className="top-icon">📞</span>
            <a href="tel:+918829906454">+91 88299 06454</a>
            <span className="top-divider">|</span>
            <a href="tel:+919414592216">+91 94145 92216</a>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="top-whatsapp"
          >
            <span className="whatsapp-dot">●</span>
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* =========================
          MAIN NAVIGATION BAR
      ========================= */}
      <header className="navbar">
        <div className="navbar-container">
          {/* Brand Logo & Heritage Title */}
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <div className="brand-logo">
              <img
                src="/shree-krishna-logo.png"
                alt="Shree Krishna Group Logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="brand-text">
              <span className="brand-name">SHREE KRISHNA</span>
              <div className="brand-group">
                <span className="group-line"></span>
                <span className="group-label">GROUP</span>
                <span className="group-line"></span>
              </div>
              <span className="brand-tagline">Crafting Music Since 1960</span>
            </div>
          </Link>

          {/* Desktop & Mobile Drawer Navigation */}
          <nav
            className={`navbar-links ${menuOpen ? "open" : ""}`}
            aria-label="Main navigation"
          >
            <NavLink to="/" end>
              HOME
            </NavLink>

            {/* Instruments Link with Interactive Category Dropdown */}
            <div
              className={`nav-dropdown-wrapper ${dropdownOpen ? "dropdown-active" : ""}`}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => setDropdownOpen(false)}
              >
                INSTRUMENTS
                <span className="dropdown-arrow">▾</span>
              </NavLink>

              <div className="nav-dropdown-menu">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <NavLink to="/offers">OFFERS</NavLink>
            <NavLink to="/contact">CONTACT US</NavLink>

            {/* Mobile Profile & Admin Portal Controls */}
            <div className="mobile-profile">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="mobile-profile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    MY ACCOUNT ({user.username})
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="mobile-admin-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      ADMIN DASHBOARD
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="mobile-login-link"
                  onClick={() => setMenuOpen(false)}
                >
                  LOGIN / SIGN UP
                </Link>
              )}
            </div>
          </nav>

          {/* Desktop Action Area */}
          <div className="navbar-actions">
            {user ? (
              <div className="desktop-user-menu">
                {user.role === "admin" && (
                  <Link to="/admin" className="admin-chip-btn">
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="profile-icon"
                  title="My Account"
                  aria-label="View Account"
                >
                  <span className="profile-initial">
                    {user.username
                      ? user.username.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </Link>
              </div>
            ) : (
              /* DESKTOP PROFILE */
          <div className="navbar-actions">
            {user ? (
              <Link to="/profile" className="profile-icon">
                <span className="profile-head"></span>
                <span className="profile-body"></span>
              </Link>
            ) : (
              <Link to="/login" className="profile-icon">
                <span className="profile-head"></span>
                <span className="profile-body"></span>
              </Link>
            )}
          </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className={`menu-button ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay to dismiss mobile drawer */}
      {menuOpen && (
        <div
          className="navbar-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navbar;
