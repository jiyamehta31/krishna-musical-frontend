import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const Home = () => {
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to safely format product image URLs
  const getImageUrl = (product) => {
    if (!product?.images || product.images.length === 0) return null;

    const primaryImg =
      product.images.find((img) => img.isPrimary) || product.images[0];
    if (!primaryImg?.url) return null;

    if (
      primaryImg.url.startsWith("http://") ||
      primaryImg.url.startsWith("https://")
    ) {
      return primaryImg.url;
    }

    const cleanPath = primaryImg.url.startsWith("/")
      ? primaryImg.url
      : `/${primaryImg.url}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      "Krishna Musicals | Authentic Indian & Western Musical Instruments";

    let isMounted = true;

    axios
      .get(`${API_BASE_URL}/api/products`)
      .then((response) => {
        if (isMounted) {
          setProducts(response.data?.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error fetching homepage products:", err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const highlights = [
    {
      label: "OUR HIGHLIGHT",
      title: "Discover Our Harmoniums",
      description:
        "Explore our collection of harmoniums, selected with care for musicians who value tone quality, seasoned teakwood craftsmanship, and musical expression.",
      image: `${API_BASE_URL}/uploads/images/amritHarmonium.png`,
      button: "Explore Harmoniums",
    },
    {
      label: "OUR CRAFTSMANSHIP",
      title: "Made With Generations of Experience",
      description:
        "Our journey combines traditional hand-carving techniques with decades of acoustic tuning to bring musicians instruments they can rely on for a lifetime.",
      image: `${API_BASE_URL}/uploads/images/chang3.jpg`,
      button: "Explore Instruments",
    },
    {
      label: "OUR LEGACY",
      title: "Four Generations of Musical Tradition",
      description:
        "Since 1960, our passion for music has been carried forward through four generations while preserving the acoustic values and devotion that built our journey.",
      image: `${API_BASE_URL}/uploads/images/drumset.png`,
      button: "Discover Our Story",
    },
  ];

  return (
    <main className="home">
      {/* =========================
          HERO
      ========================= */}
      <section className="hero">
        <img
          src="/home-hero.png"
          alt="Shree Krishna Group - Musical Instruments"
          className="hero-image"
          fetchPriority="high"
        />

        <Link
          to="/products"
          className="hero-image-button"
          aria-label="Explore Instruments"
        >
          Explore Instruments
        </Link>
      </section>

      {/* =========================
          LEGACY STATS
      ========================= */}
      <section className="legacy-stats">
        <div className="stat">
          <div className="stat-icon">✦</div>
          <div>
            <h2>60+ Years</h2>
            <p>
              Serving musicians and music academies with dedicated craftsmanship
              since 1960.
            </p>
          </div>
        </div>

        <div className="stat">
          <div className="stat-icon">♬</div>
          <div>
            <h2>7 Branches</h2>
            <p>
              Multiple accessible showroom locations, including 3 regional hubs
              in Pali, Rajasthan.
            </p>
          </div>
        </div>

        <div className="stat">
          <div className="stat-icon">♢</div>
          <div>
            <h2>Authorized Dealer</h2>
            <p>
              Official dealership for leading domestic and international musical
              brands.
            </p>
          </div>
        </div>

        <div className="stat">
          <div className="stat-icon">⚒</div>
          <div>
            <h2>A1 Repairing</h2>
            <p>
              Expert acoustic servicing, bellows replacement, brass reed tuning,
              and safe delivery.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          OUR LEGACY
      ========================= */}
      <section className="about-section">
        <div className="about-content">
          <p className="section-label">OUR LEGACY</p>
          <h2>Four Generations of Musical Tradition</h2>
          <p>
            Since 1960, our journey has been built around a passion for music,
            quality instruments, and trusted service. Today, the fourth
            generation continues that legacy while preserving the craftsmanship
            and values passed down through the decades.
          </p>
          <p>
            From handmade concert harmoniums to authorized brand dealerships,
            fine repairs, and safe delivery across India, we strive to provide
            musicians with instruments they can trust on stage and in the
            studio.
          </p>
        </div>
      </section>

      {/* =========================
          HIGHLIGHTS
      ========================= */}
      <section className="highlight-section">
        <div className="highlight-image">
          <img
            src={highlights[highlightIndex].image}
            alt={highlights[highlightIndex].title}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="highlight-content">
          <p className="section-label">{highlights[highlightIndex].label}</p>
          <h2>{highlights[highlightIndex].title}</h2>
          <p>{highlights[highlightIndex].description}</p>

          <Link to="/products" className="highlight-button">
            {highlights[highlightIndex].button}
          </Link>

          <div className="highlight-controls">
            <button
              onClick={() =>
                setHighlightIndex(
                  (highlightIndex - 1 + highlights.length) % highlights.length,
                )
              }
              aria-label="Previous highlight"
            >
              ←
            </button>

            <div className="highlight-dots">
              {highlights.map((_, index) => (
                <button
                  key={index}
                  className={index === highlightIndex ? "active" : ""}
                  onClick={() => setHighlightIndex(index)}
                  aria-label={`Go to highlight ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setHighlightIndex((highlightIndex + 1) % highlights.length)
              }
              aria-label="Next highlight"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURED INSTRUMENTS
      ========================= */}
      <section className="featured-section">
        <div className="featured-heading">
          <p className="section-label">FEATURED INSTRUMENTS</p>
          <h2>Explore Our Finest Collection</h2>
          <p>Handcrafted sound and acoustic precision for every musician</p>
        </div>

        <div className="featured-grid">
          {loading ? (
            <div className="featured-loading-message">
              Loading featured instruments...
            </div>
          ) : products.length === 0 ? (
            <div className="featured-loading-message">
              No instruments currently listed. Visit our showroom for custom
              orders.
            </div>
          ) : (
            products.slice(0, 3).map((product) => {
              const imageUrl = getImageUrl(product);

              return (
                <div className="featured-card" key={product._id}>
                  <div className="featured-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.images?.[0]?.alt || product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="featured-placeholder">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div className="featured-info">
                    <p className="featured-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p className="featured-brand">
                      {product.brand || "Krishna Craft"}
                    </p>
                    {product.price > 0 && (
                      <p className="featured-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    )}
                    <Link
                      to={`/products/${product._id}`}
                      className="featured-link"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="featured-action">
          <Link to="/products" className="section-button">
            View All Instruments
          </Link>
        </div>
      </section>

      {/* =========================
          WHY CHOOSE US
      ========================= */}
      <section className="why-section">
        <div className="why-heading">
          <p className="section-label">WHY CHOOSE US</p>
          <h2>Experience You Can Trust</h2>
          <p>
            Built over generations, our commitment to sound quality and
            integrity guides everything we build.
          </p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">✦</div>
            <h3>60+ Years</h3>
            <p>
              Over six decades of experience in acoustic voicing and instrument
              craftsmanship.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">♫</div>
            <h3>4th Generation</h3>
            <p>
              A continuous family tradition carried forward with modern quality
              standards.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">✧</div>
            <h3>Handmade Craftsmanship</h3>
            <p>
              Seasoned woods, premium brass reeds, and hand-tuned key mechanics.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">✓</div>
            <h3>Authorized Dealership</h3>
            <p>
              Guaranteed genuine instruments backed by manufacturer warranties.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          SPECIAL OFFERS
      ========================= */}
      <section className="offers-section">
        <div className="offers-content">
          <p className="section-label">SPECIAL OFFERS</p>
          <h2>Special Selections for Every Musician</h2>
          <p>
            Discover our seasonal discounts and festival packages on harmoniums,
            tanpuras, and percussion sets.
          </p>
          <Link to="/offers" className="offers-button">
            Explore Offers
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
