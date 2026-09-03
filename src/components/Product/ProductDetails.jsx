import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./ProductDetails.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const WHATSAPP_NUMBER = "918829906454";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  // 1. Reset state during render if URL :id changes (React recommended pattern)
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setProduct(null);
    setError("");
    setActiveImage(0);
  }

  // 2. Derive loading state instead of manually setting it in useEffect
  const loading = !product && !error;

  const formatImageUrl = (rawUrl) => {
    if (!rawUrl) return null;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    const cleanPath = rawUrl.replace("../", "").replace(/^\/+/, "");
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // 3. Keep useEffect purely for external synchronization and async fetching
  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;

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

    const message = `*Instrument Enquiry - Krishna Musicals*
*Product:* ${product.name}
*Category:* ${product.category || "N/A"}
*Brand:* ${product.brand || "Krishna Craft"}
*Price:* ${
      product.price > 0
        ? `₹${Number(product.price).toLocaleString("en-IN")}`
        : "Price on Request"
    }

Hello, I would like to check availability, sound clips, and shipping details for this instrument.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
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

  return (
    <main className="product-details-page">
      <div className="product-details-breadcrumb">
        <button
          type="button"
          className="breadcrumb-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <span>/</span>
        <Link to="/products">Instruments</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-details">
        {/* Left Column: Media Gallery */}
        <div className="product-gallery">
          <div className="main-image-container">
            {hasImages && images.length > 1 && (
              <button
                type="button"
                className="carousel-btn prev"
                onClick={() =>
                  setActiveImage(
                    activeImage === 0 ? images.length - 1 : activeImage - 1,
                  )
                }
                aria-label="Previous image"
              >
                ←
              </button>
            )}

            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={images[activeImage]?.alt || product.name}
              />
            ) : (
              <div className="no-image-placeholder">No Image Available</div>
            )}

            {hasImages && images.length > 1 && (
              <button
                type="button"
                className="carousel-btn next"
                onClick={() =>
                  setActiveImage(
                    activeImage === images.length - 1 ? 0 : activeImage + 1,
                  )
                }
                aria-label="Next image"
              >
                →
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="product-thumbnails">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={image._id || index}
                  className={`thumbnail-wrapper ${
                    activeImage === index ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={formatImageUrl(image.url)}
                    alt={image.alt || `${product.name} thumbnail ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Instrument Data & Conversion */}
        <div className="product-details-info">
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>

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
                {product.brand || "Krishna Craft / Traditional"}
              </span>
            </div>

            {product.category && (
              <div className="product-meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{product.category}</span>
              </div>
            )}
          </div>

          {/* Technical Specifications */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="product-specifications">
                <h3>Technical Specifications</h3>
                <div className="specifications-list">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div className="specification-item" key={key}>
                        <span className="spec-key">
                          {formatSpecificationKey(key)}
                        </span>
                        <span className="spec-val">
                          {formatSpecificationValue(value)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Direct Lead Conversion */}
          <div className="product-enquiry">
            <h3>Interested in this instrument?</h3>
            <p>
              Direct workshop assistance, customized octave tuning
              (432Hz/440Hz), and safe delivery across India.
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
    </main>
  );
};

export default ProductDetails;
