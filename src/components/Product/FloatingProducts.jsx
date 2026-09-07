import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./FloatingProducts.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const WHATSAPP_NUMBER = "918829906454";

const FloatingProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch top active instruments to feature
  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${API_BASE_URL}/api/products?sort=rating`)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.products)
            ? res.data.products
            : [];
        const active = list.filter((p) => p.status !== "inactive");
        setFeaturedProducts(active.slice(0, 5));
      })
      .catch((err) => {
        console.error("Error loading floating featured items:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-cycle through instruments every 8 seconds when card is not expanded
  useEffect(() => {
    if (featuredProducts.length <= 1 || isOpen || isDismissed) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [featuredProducts.length, isOpen, isDismissed]);

  if (isDismissed || featuredProducts.length === 0) return null;

  const currentProduct = featuredProducts[currentIndex];

  const formatImageUrl = (img) => {
    const rawUrl = Array.isArray(img)
      ? img.find((i) => i.isPrimary)?.url || img[0]?.url
      : img;
    if (!rawUrl) return "/images/placeholder-instrument.jpg";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
      return rawUrl;
    const cleanPath = rawUrl.replace("../", "").replace(/^\/+/, "");
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const priceText =
      currentProduct.price > 0
        ? `₹${Number(currentProduct.price).toLocaleString("en-IN")}`
        : "Price on Request";

    const text = `*Inquiry from Floating Product Widget - Krishna Musicals*\n*Instrument:* ${currentProduct.name}\n*Price:* ${priceText}\n\nNamaste! Is this model available for trial or delivery in Pali?`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className={`floating-product-widget ${isOpen ? "expanded" : ""}`}>
      {/* Minimized Pill View */}
      {!isOpen && (
        <div
          className="floating-pill"
          onClick={() => setIsOpen(true)}
          role="button"
          tabIndex={0}
        >
          <span className="live-indicator">●</span>
          <img
            src={formatImageUrl(currentProduct.images)}
            alt={currentProduct.name}
            className="floating-thumb"
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder-instrument.jpg";
            }}
          />
          <div className="pill-info">
            <span className="pill-tag">FEATURED</span>
            <span className="pill-title">{currentProduct.name}</span>
          </div>
          <button
            type="button"
            className="pill-dismiss"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Expanded Modal Card */}
      {isOpen && (
        <div className="floating-card">
          <div className="card-header">
            <span className="badge">Featured Instrument</span>
            <button
              type="button"
              className="card-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close card"
            >
              ✕
            </button>
          </div>

          <div className="card-media">
            <img
              src={formatImageUrl(currentProduct.images)}
              alt={currentProduct.name}
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder-instrument.jpg";
              }}
            />
          </div>

          <div className="card-content">
            <span className="card-category">{currentProduct.category}</span>
            <h4 className="card-name">{currentProduct.name}</h4>
            <p className="card-price">
              {currentProduct.price > 0
                ? `₹${Number(currentProduct.price).toLocaleString("en-IN")}`
                : "Price on Request"}
            </p>

            <div className="card-controls">
              {featuredProducts.length > 1 && (
                <div className="card-nav-dots">
                  {featuredProducts.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`dot ${idx === currentIndex ? "active" : ""}`}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`View instrument ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="card-buttons">
              <Link
                to={`/products/${currentProduct._id}`}
                className="view-details-btn"
                onClick={() => setIsOpen(false)}
              >
                View Specs
              </Link>
              <button
                type="button"
                className="enquire-now-btn"
                onClick={handleWhatsApp}
              >
                Inquire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingProducts;
