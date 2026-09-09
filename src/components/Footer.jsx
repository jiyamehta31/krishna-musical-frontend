import { Link } from "react-router-dom";
import "./Footer.css"
;

const WHATSAPP_NUMBER = "919414592216";

const Footer = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Krishna Musicals, I am reaching out from your website footer with an enquiry.",
  )}`;

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand">
          <Link to="/" className="footer-brand-title">
            Krishna Musicals
          </Link>
          <p className="footer-brand-tagline">
            Four generations of acoustic craftsmanship since 1960. Handcrafted
            harmoniums, classical sitars, tablas, and authorized brand
            instruments.
          </p>
          <div className="footer-hours">
            <span>Showroom & Workshop Hours:</span>
            <p>Mon – Sat: 10:00 AM – 8:00 PM IST</p>
          </div>
        </div>

        {/* Quick Links Navigation */}
        <div className="footer-links">
          <h3>Explore Catalog</h3>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link to="/">Home</Link>
            <Link to="/products">All Instruments</Link>
            <Link to="/offers">Special Offers</Link>
            <Link to="/contact">Contact & Custom Orders</Link>
            <Link to="/profile">My Account</Link>
          </nav>
        </div>

        {/* Instrument Categories */}
        <div className="footer-links">
          <h3>Collections</h3>
          <nav className="footer-nav" aria-label="Instrument categories">
            <Link to="/products?category=Harmonium">Harmoniums</Link>
            <Link to="/products?category=Sitar">Classical Sitars</Link>
            <Link to="/products?category=Tabla">Tabla Pairs</Link>
            <Link to="/products?category=Tanpura">Tanpuras</Link>
            <Link to="/products?category=Accessories">Padded Bags & Reeds</Link>
          </nav>
        </div>

        {/* Contact & Workshop Details */}
        <div className="footer-contact">
          <h3>Workshop & Inquiries</h3>
          <address className="footer-address">
            <p>
              <span className="contact-icon">📍</span>
              <span>Pali & Rajasthan Showrooms, India</span>
            </p>
            <p>
              <span className="contact-icon">📞</span>
              <a href="tel:+919414592216">+91 9414592216 </a>
            </p>
            <p>
              <span className="contact-icon">💬</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-quick-link"
              >
                Instant WhatsApp Support
              </a>
            </p>
            <p>
              <span className="contact-icon">✉️</span>
              <a href="mailto:info@krishnamusicals.com">
                info@krishnamusicals.com
              </a>
            </p>
          </address>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026 Krishna Musicals. All rights reserved.</p>
          <div className="footer-bottom-actions">
            <span>Handcrafted in India</span>
            <span className="separator">•</span>
            <Link to="/admin/login" className="admin-login-link">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
