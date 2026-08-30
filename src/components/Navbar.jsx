import { useState } from "react";
import { Link, NavLink } from "react-router-dom";import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

 const storedUser = localStorage.getItem("user");
 const user =
   storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  return (
    <>
      {/* TOP INFORMATION BAR */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-item">
            <span className="top-icon">⌖</span>
            Gandhi Murti, Pali, Rajasthan, India
          </div>

          <div className="top-item">
            <span className="top-icon">☎</span>
            +91 94145 92216
            <span className="top-divider">|</span>
            +91 90010 81455
          </div>

          <a
            href="https://wa.me/919001081455"
            target="_blank"
            rel="noopener noreferrer"
            className="top-whatsapp"
          >
            <span>◉</span>
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* BRAND */}
          <Link to="/" className="brand">
            <div className="brand-logo">
              <img
                src="/shree-krishna-logo.png"
                alt="Shree Krishna Group Logo"
              />
            </div>

            <div className="brand-text">
              <div className="brand-name">SHREE KRISHNA</div>

              <div className="brand-group">
                <span></span>
                GROUP
                <span></span>
              </div>

              <div className="brand-tagline">Crafting Music Since 1960</div>
            </div>
          </Link>

          {/* NAVIGATION */}
          <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              HOME
            </NavLink>
            <NavLink to="/products" onClick={() => setMenuOpen(false)}>
              INSTRUMENTS
              <span className="dropdown-arrow">⌄</span>
            </NavLink>

            <NavLink to="/about" onClick={() => setMenuOpen(false)}>
              ABOUT US
            </NavLink>

            <NavLink to="/offers" onClick={() => setMenuOpen(false)}>
              OFFERS
            </NavLink>

            <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
              CONTACT US
            </NavLink>

            {/* MOBILE PROFILE */}
            <div className="mobile-profile">
              {user ? (
                <Link to="/profile">PROFILE</Link>
              ) : (
                <Link to="/login">LOGIN</Link>
              )}
            </div>
          </div>

          {/* DESKTOP PROFILE */}
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

          {/* MOBILE MENU */}
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
