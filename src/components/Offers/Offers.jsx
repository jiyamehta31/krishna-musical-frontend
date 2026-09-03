import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Offers.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const WHATSAPP_NUMBER = "918829906454";

const DEFAULT_OFFERS = [
  {
    tag: "FESTIVAL SPECIAL",
    title: "Concert Harmonium Package",
    discount: "Up to 15% Off",
    description:
      "Special discount on custom-tuned 39-key folding harmoniums with brass reeds. Includes a padded travel gig bag and tuning warranty.",
    actionText: "Claim on WhatsApp",
    type: "whatsapp",
    whatsappQuery:
      "Hello Krishna Musicals, I am interested in claiming the Concert Harmonium Package offer.",
  },
  {
    tag: "STUDENT & ACADEMY",
    title: "Music School Starter Bundles",
    discount: "Bulk Discounts",
    description:
      "Exclusive packages for music learners and devotional academies on tablas, tanpuras, and sitars with free setup accessories.",
    actionText: "Inquire for Academy",
    type: "whatsapp",
    whatsappQuery:
      "Hello, I would like details about your Music School Starter Bundles for academies.",
  },
  {
    tag: "WORKSHOP CARE",
    title: "Free Bellows & Reed Servicing",
    discount: "Complimentary Service",
    description:
      "Get complimentary reed inspection, cleaning, and bellows leak checks on any vintage instrument brought to our Pali or Rajasthan showrooms.",
    actionText: "Book Workshop Slot",
    type: "link",
    target: "/contact",
  },
];

const Offers = () => {
  const [offers, setOffers] = useState(DEFAULT_OFFERS);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Special Offers & Packages | Krishna Musicals";

    let isMounted = true;

    // Gracefully checks if dynamic offers are deployed on the backend
    axios
      .get(`${API_BASE_URL}/api/offers`)
      .then((res) => {
        if (
          isMounted &&
          Array.isArray(res.data?.data) &&
          res.data.data.length > 0
        ) {
          setOffers(res.data.data);
        }
      })
      .catch(() => {
        // Falls back seamlessly to curated DEFAULT_OFFERS without breaking the UI
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = (offer) => {
    if (offer.type === "whatsapp" || offer.whatsappQuery) {
      const message =
        offer.whatsappQuery ||
        `Hi Krishna Musicals, I am interested in your offer: "${offer.title}".`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="offers-page">
      {/* Header */}
      <section className="offers-page-header">
        <p className="section-label">EXCLUSIVE DEALS</p>
        <h1>Offers & Seasonal Specials</h1>
        <p>
          Take advantage of curated packages, seasonal festival discounts, and
          workshop servicing privileges for musicians across India.
        </p>
      </section>

      {/* Offers Grid */}
      <section className="offers-list">
        {offers.map((offer, index) => (
          <div className="offer-card" key={offer._id || index}>
            <div className="offer-card-top">
              <span className="offer-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              {offer.tag && <span className="offer-badge">{offer.tag}</span>}
            </div>

            <h2>{offer.title}</h2>
            {offer.discount && (
              <p className="offer-highlight">{offer.discount}</p>
            )}
            <p className="offer-description">{offer.description}</p>

            {offer.type === "link" ? (
              <Link to={offer.target || "/contact"} className="offer-link-btn">
                {offer.actionText || "Learn More"} →
              </Link>
            ) : (
              <button
                type="button"
                className="offer-link-btn"
                onClick={() => handleAction(offer)}
              >
                {offer.actionText || "Inquire on WhatsApp"} →
              </button>
            )}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="offers-page-cta">
        <div className="offers-page-cta-content">
          <p className="section-label">CUSTOM ACOUSTICS</p>
          <h2>Looking for a Custom Instrument or Bulk Order?</h2>
          <p>
            Whether you need custom pitch tuning (432Hz/440Hz), teakwood
            finishings, or devotional ensemble orders, our craftsmen are happy
            to assist.
          </p>
          <Link to="/contact" className="offers-page-button">
            Get in Touch With Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Offers;
