import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { transformInstagramPostToProduct } from "../../utils/instagramAdapter";
import "./ProductDetails.css";
import Review from "../Reviews/Review";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const INSTAGRAM_FEED_URL =
  import.meta.env.VITE_INSTAGRAM_FEED_URL ||
  "https://feeds.behold.so/xzK6rxt0HtOb3FvyCdHg";

const WHATSAPP_NUMBER = "918829906454";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reviewsRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  // 1. Reset state during render if URL :id changes
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setProduct(null);
    setError("");
    setActiveImage(0);
  }

  // 2. Derive loading state instead of manual booleans
  const loading = !product && !error;

  const formatImageUrl = (rawUrl) => {
    if (!rawUrl) return "/images/placeholder-instrument.jpg";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    const cleanPath = rawUrl.replace("../", "").replace(/^\/+/, "");
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // 3. Dual-mode data fetching (Instagram feed vs MongoDB database)
  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    // A. Handle Instagram items via Behold.so feed
    if (id?.startsWith("ig-")) {
      const rawPostId = id.replace("ig-", "");

      fetch(INSTAGRAM_FEED_URL)
        .then((res) => {
          if (!res.ok) throw new Error(`Behold HTTP error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;

          const rawPosts = Array.isArray(data)
            ? data
            : Array.isArray(data?.posts)
              ? data.posts
              : [];

          const targetPost = rawPosts.find(
            (item) => String(item.id) === String(rawPostId),
          );

          if (!targetPost) {
            setError("Instagram showroom demo post not found or removed.");
            return;
          }

          const transformed = transformInstagramPostToProduct(targetPost);

          // Add clean details attributes
          transformed.specifications = {
            "Sourced From": "Krishna Musicals Live Showroom Feed",
            "Workshop Availability": "Showroom Demo Unit (Pali Workshop)",
            "Original Post": targetPost.permalink || "Instagram",
          };

          setProduct(transformed);
          document.title = `${transformed.name} | Krishna Musicals`;
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("Error loading Instagram post details:", err);
          setError(
            "Failed to load Instagram item. Please check your connection.",
          );
        });

      return () => {
        isMounted = false;
      };
    }

    // B. Handle regular MongoDB products
    axios
      .get(`${API_BASE_URL}/api/products/${id}`)
      .then((response) => {
        if (!isMounted) return;
        const fetchedProduct = response.data?.data;
        if (!fetchedProduct) {
          setError("Product details could not be found.");
        } else {
          setProduct(fetchedProduct);
          document.title = `${fetchedProduct.name} | Krishna Musicals`;
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching product details:", err);
        setError("Unable to load instrument details. Please try again later.");
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleWhatsAppEnquiry = () => {
    if (!product) return;

    const currentUrl = window.location.href;
    const priceText =
      product.price > 0
        ? `₹${Number(product.price).toLocaleString("en-IN")}`
        : "Price on Request";

    const message = `*Instrument Enquiry - Krishna Musicals*
*Product:* ${product.name}
*Category:* ${product.category || "Other Instruments"}
*Brand:* ${product.brand || "Krishna Musicals"}
*Price:* ${priceText}
*Link:* ${currentUrl}

Namaste! I would like to check availability, acoustic sound samples, and delivery timelines for this instrument.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Safe parsing of specs in case older records have stringified JSON
  const getParsedSpecifications = () => {
    if (!product?.specifications) return {};
    if (typeof product.specifications === "string") {
      try {
        return JSON.parse(product.specifications);
      } catch {
        return {};
      }
    }
    return product.specifications;
  };

  const formatSpecificationValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${formatSpecificationValue(val)}`)
        .join(" · ");
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const formatSpecificationKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <main className="product-details-loading">
        <div className="loading-spinner" aria-hidden="true" />
        <p>Loading instrument details...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-details-error">
        <h2>Instrument Not Found</h2>
        <p>
          {error ||
            "The instrument you requested does not exist or has been removed."}
        </p>
        <Link to="/products" className="back-to-products-btn">
          ← Back to All Instruments
        </Link>
      </main>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const hasImages = images.length > 0;
  const currentImageUrl = hasImages
    ? formatImageUrl(images[activeImage]?.url)
    : null;

  const specifications = getParsedSpecifications();
  const hasSpecifications = Object.keys(specifications).length > 0;

  const avgRating = Number(product.averageRating) || 0;
  const reviewCount =
    Number(product.numReviews) || product.reviews?.length || 0;

  return (
    <main className="product-details-page">
      {/* Breadcrumb Bar */}
      <nav className="product-details-breadcrumb" aria-label="Breadcrumb">
        <button
          type="button"
          className="breadcrumb-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <span aria-hidden="true">/</span>
        <Link to="/products">Instruments</Link>
        <span aria-hidden="true">/</span>
        <span className="current-breadcrumb">{product.name}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="product-details">
        {/* Left Column: Gallery */}
        <div className="product-gallery">
          <div className="main-image-container">
            {hasImages && images.length > 1 && (
              <button
                type="button"
                className="carousel-btn prev"
                onClick={() =>
                  setActiveImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1,
                  )
                }
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={images[activeImage]?.alt || product.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder-instrument.jpg";
                }}
              />
            ) : (
              <div className="no-image-placeholder">No Image Available</div>
            )}

            {hasImages && images.length > 1 && (
              <button
                type="button"
                className="carousel-btn next"
                onClick={() =>
                  setActiveImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1,
                  )
                }
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="product-thumbnails">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={image.url || index}
                  className={`thumbnail-wrapper ${
                    activeImage === index ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View photo ${index + 1}`}
                >
                  <img
                    src={formatImageUrl(image.url)}
                    alt={image.alt || `${product.name} thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src =
                        "/images/placeholder-instrument.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Instrument Details */}
        <div className="product-details-info">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p className="product-category">{product.category}</p>
            {product.isInstagram && (
              <span
                style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
              >
                📸 Instagram Showroom
              </span>
            )}
          </div>

          <h1>{product.name}</h1>

          {/* Social Proof Rating Bar (Hidden on raw Instagram feeds if not reviewed) */}
          {!product.isInstagram && (
            <div
              className="product-rating-row"
              onClick={scrollToReviews}
              role="button"
              tabIndex={0}
            >
              <div
                className="stars"
                aria-label={`Rated ${avgRating} out of 5 stars`}
              >
                {"★".repeat(Math.round(avgRating))}
                {"☆".repeat(5 - Math.round(avgRating))}
              </div>
              <span className="rating-score">
                {avgRating > 0 ? avgRating.toFixed(1) : "New"}
              </span>
              <span className="rating-count">
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          <div className="product-price-stock-row">
            {product.price > 0 ? (
              <p className="product-price">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>
            ) : (
              <p className="product-price-request">Price on Request</p>
            )}

            <span
              className={`stock-badge ${
                Number(product.stock) > 0 ? "in-stock" : "made-to-order"
              }`}
            >
              {Number(product.stock) > 0 ? "In Stock" : "Made to Order"}
            </span>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-meta">
            <div className="product-meta-item">
              <span className="meta-label">Brand</span>
              <span className="meta-value">
                {product.brand || "Krishna Craft / Authentic"}
              </span>
            </div>

            {product.category && (
              <div className="product-meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{product.category}</span>
              </div>
            )}

            {product.instagramUrl && (
              <div className="product-meta-item">
                <span className="meta-label">Original Post</span>
                <span className="meta-value">
                  <a
                    href={product.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#b58a3a", textDecoration: "underline" }}
                  >
                    View on Instagram ↗
                  </a>
                </span>
              </div>
            )}
          </div>

          {/* Specifications */}
          {hasSpecifications && (
            <div className="product-specifications">
              <h3>Technical Specifications</h3>
              <div className="specifications-list">
                {Object.entries(specifications).map(([key, value]) => (
                  <div className="specification-item" key={key}>
                    <span className="spec-key">
                      {formatSpecificationKey(key)}
                    </span>
                    <span className="spec-val">
                      {formatSpecificationValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Lead Conversion */}
          <div className="product-enquiry">
            <h3>Interested in this instrument?</h3>
            <p>
              Direct workshop guidance, customized pitch/octave tuning (432Hz /
              440Hz), and secure all-India doorstep shipping.
            </p>

            <button
              type="button"
              className="enquiry-btn"
              onClick={handleWhatsAppEnquiry}
            >
              Enquire on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Sub-Component: Only rendered for native database products */}
      {!product.isInstagram && (
        <div ref={reviewsRef}>
          <Review product={product} setProduct={setProduct} productId={id} />
        </div>
      )}
    </main>
  );
};

export default ProductDetails;
