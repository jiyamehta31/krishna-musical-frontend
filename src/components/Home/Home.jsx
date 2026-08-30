import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";

const Home = () => {
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("https://krishna-musical-backend-1.onrender.com/api/products")
      .then((response) => {
        setProducts(response.data.data);
      })
      .catch((err) => {
        console.log("Error Fetching data", err);
      });
  }, []);

  const highlights = [
    {
      label: "OUR HIGHLIGHT",
      title: "Discover Our Harmoniums",
      description:
        "Explore our collection of harmoniums, selected with care for musicians who value quality, craftsmanship, and musical expression.",
      image: "https://krishna-musical-backend-1.onrender.com/uploads/images/amritHarmonium.png",
      button: "Explore Harmoniums",
    },
    {
      label: "OUR CRAFTSMANSHIP",
      title: "Made With Generations of Experience",
      description:
        "Our journey combines traditional craftsmanship with decades of experience to bring musicians instruments they can rely on.",
      image: "https://krishna-musical-backend-1.onrender.com/uploads/images/chang3.jpg",
      button: "Explore Instruments",
    },
    {
      label: "OUR LEGACY",
      title: "Four Generations of Musical Tradition",
      description:
        "Since 1960, our passion for music has been carried forward through four generations while preserving the values that built our journey.",
      image: "https://krishna-musical-backend-1.onrender.com/uploads/images/drumset.png",
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
        />

        {/* Real clickable button placed over the button in the image */}
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
            <h2>60+ Years of</h2>
            <p>
              Experience
              <br />
              Serving music lovers
              <br />
              since 1960
            </p>
          </div>
        </div>

        <div className="stat">
          <div className="stat-icon">♬</div>

          <div>
            <h2>7 Branches</h2>
            <p>
              3 in Pali
              <br />
              Easily accessible
              <br />
              locations
            </p>
          </div>
        </div>

        <div className="stat">
          <div className="stat-icon">♢</div>

          <div>
            <h2>Authorized</h2>
            <p>
              Dealership
              <br />
              Trusted by leading
              <br />
              brands
            </p>
          </div>
        </div>

        <div className="stat">
          <div className="stat-icon">⚒</div>

          <div>
            <h2>A1 Repairing &</h2>
            <p>
              Branded Delivery
              <br />
              Quality service and
              <br />
              reliable delivery
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
            and values passed down through the years.
          </p>

          <p>
            From handmade work to authorized dealerships, repairs, and branded
            delivery, we strive to provide musicians with instruments and
            service they can rely on.
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

          <p>Handpicked instruments for every musician</p>
        </div>

        <div className="featured-grid">
          {products.slice(0, 3).map((product) => (
            <div className="featured-card" key={product._id}>
              <div className="featured-image">
                <img
                  src={`https://krishna-musical-backend-1.onrender.com/${product.images?.[0]?.url}`}
                  alt={product.images?.[0]?.alt || product.name}
                />
              </div>

              <div className="featured-info">
                <p className="featured-category">{product.category}</p>

                <h3>{product.name}</h3>

                <p className="featured-brand">{product.brand}</p>

                <Link to={`/products/${product._id}`} className="featured-link">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
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
            Built over generations, our commitment to quality and craftsmanship
            continues to guide everything we do.
          </p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">✦</div>

            <h3>60+ Years</h3>

            <p>
              Decades of experience in musical instruments and serving
              musicians.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">♫</div>

            <h3>4th Generation</h3>

            <p>A musical tradition carried forward through four generations.</p>
          </div>

          <div className="why-card">
            <div className="why-icon">✧</div>

            <h3>Handmade Craftsmanship</h3>

            <p>
              Traditional craftsmanship and attention to detail remain at the
              heart of our work.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">✓</div>

            <h3>Authorized Dealership</h3>

            <p>Access to instruments through authorized brand dealerships.</p>
          </div>
        </div>
      </section>

      {/* =========================
          SPECIAL OFFERS
      ========================= */}

      <section className="offers-section">
        <div className="offers-content">
          <p className="section-label">SPECIAL OFFERS</p>

          <h2>Something Special for Every Musician</h2>

          <p>
            Discover our latest offers and special selections on musical
            instruments. Get in touch with us to know more about current
            availability and offers.
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
