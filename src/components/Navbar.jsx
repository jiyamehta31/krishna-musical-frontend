import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css"
;

const WHATSAPP_PRIMARY = "919414592216";

const CATEGORIES = [
  { name: "All Instruments", path: "/products" },
  { name: "School & Band Items", path: "/products?category=School+Items" },
  { name: "Harmoniums", path: "/products?category=Harmonium" },
  { name: "Classical Sitars", path: "/products?category=Sitar" },
  { name: "Tabla Sets", path: "/products?category=Tabla" },
  { name: "Guitars", path: "/products?category=Guitars" },
  {
    name: "Keyboards & Pianos",
    path: "/products?category=Keyboards+%26+Pianos",
  },
  { name: "Tanpuras", path: "/products?category=Tanpura" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close menus when any link inside the navigation is clicked
  const handleNavClick = (e) => {
    // If the click is on an anchor or inside an anchor tag, close all overlays
    if (e.target.closest("a")) {
      setMenuOpen(false);
      setDropdownOpen(false);
    }
  };

  // Derive user session directly during render
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
            <span>16, Meera Marg, Gandhi Murti, Pali, Rajasthan</span>
          </div>

          <div className="top-item">
            <span className="top-icon">📞</span>
            <a href="tel:+919414592216">+91 94145 92216</a>
            <span className="top-divider">|</span>
            <a href="tel:+918209053038">+91 82090 53038</a>
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
          <Link
            to="/"
            className="brand"
            onClick={() => {
              setMenuOpen(false);
              setDropdownOpen(false);
            }}
          >
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
            onClick={handleNavClick}
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
                onClick={() => {
                  // If clicked on mobile, toggle the dropdown menu
                  if (window.innerWidth <= 900) {
                    setDropdownOpen(!dropdownOpen);
                  }
                }}
              >
                INSTRUMENTS
                <span className="dropdown-arrow">▾</span>
              </NavLink>

              <div className="nav-dropdown-menu">
                {CATEGORIES.map((cat) => (
                  <Link key={cat.name} to={cat.path} className="dropdown-item">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <NavLink to="/offers">OFFERS</NavLink>
            <NavLink to="/about">ABOUT US</NavLink>
            <NavLink to="/contact">VISIT SHOWROOM</NavLink>

            {/* Mobile Profile & Admin Portal Controls */}
            <div className="mobile-profile">
              {user ? (
                <>
                  <Link to="/profile" className="mobile-profile-link">
                    MY ACCOUNT ({user.username})
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="mobile-admin-link">
                      ADMIN DASHBOARD
                    </Link>
                  )}
                </>
              ) : (
                <Link to="/login" className="mobile-login-link">
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
                  title={`My Account (${user.username || "User"})`}
                  aria-label="View Account"
                >
                  <span className="profile-head"></span>
                  <span className="profile-body"></span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="profile-icon"
                title="Login / Sign Up"
                aria-label="Login"
              >
                <span className="profile-head"></span>
                <span className="profile-body"></span>
              </Link>
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

      {/* Backdrop overlay for mobile drawer */}
      {menuOpen && (
        <div
          className="navbar-backdrop"
          onClick={() => {
            setMenuOpen(false);
            setDropdownOpen(false);
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navbar;
