/* =========================
   OFFERS PAGE
========================= */

import "./Offers.css";
import { Link } from "react-router-dom";

const Offers = () => {
  const offers = [
    {
      title: "Special Offers",
      description:
        "Discover our latest offers and special opportunities across our collection of musical instruments.",
    },
    {
      title: "Featured Instruments",
      description:
        "Explore selected instruments that we are currently highlighting for musicians.",
    },
    {
      title: "Visit Our Store",
      description:
        "Get in touch with us to learn more about our current offers and available instruments.",
    },
  ];

  return (
    <main className="offers-page">
      {/* Header */}
      <section className="offers-page-header">
        <p className="section-label">SPECIAL OFFERS</p>

        <h1>Offers & Highlights</h1>

        <p>
          Explore our latest offers, featured instruments, and opportunities
          available at our stores.
        </p>
      </section>

      {/* Offers */}
      <section className="offers-list">
        {offers.map((offer, index) => (
          <div className="offer-card" key={index}>
            <p className="offer-number">{String(index + 1).padStart(2, "0")}</p>

            <h2>{offer.title}</h2>

            <p>{offer.description}</p>

            <button className="offer-link">Learn More</button>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="offers-page-cta">
        <div className="offers-page-cta-content">
          <p className="section-label">HAVE A QUESTION?</p>

          <h2>Looking for Something Specific?</h2>

          <p>
            Get in touch with us to learn more about our instruments and current
            offers.
          </p>

          <Link to="/contact" className="offers-page-button">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Offers;
