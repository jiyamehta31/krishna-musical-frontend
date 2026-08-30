import "./Footer.css"
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>Logo</h2>
          <p>
            Explore quality musical instruments and find the right instrument
            for your music journey.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/">Instruments</a>
          <a href="/">About</a>
          <a href="/">Contact</a>
          <Link to="/admin/login" className="admin-login-link">
            Admin Login
          </Link>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>📞 +91 XXXXX XXXXX</p>
          <p>✉️ example@email.com</p>
          <p>📍 Udaipur, Rajasthan</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Logo. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
