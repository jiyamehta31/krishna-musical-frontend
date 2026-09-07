import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const getImageUrl = () => {
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

    const cleanPath = primaryImg.url.replace("../", "").replace(/^\/+/, "");
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const imageUrl = getImageUrl();

  const avgRating = Number(product?.averageRating) || 0;
  const reviewCount =
    Number(product?.numReviews) || product?.reviews?.length || 0;

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
    // if (product.isInstagram && product.instagramUrl) {
    //   window.open(product.instagramUrl, "_blank", "noopener,noreferrer");
    //   return;
    // }
    navigate(`/products/${product._id}`);
  };

  return (
    <article
      className="product-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick();
        }
      }}
    >
      <div className="product-image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder-instrument.jpg";
            }}
          />
        ) : (
          <div className="product-image-placeholder">No Image Available</div>
        )}
      </div>

      <div className="product-info">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          {product.brand && (
            <span className="product-brand">{product.brand}</span>
          )}
        </div>

        <h3 className="product-title">{product.name}</h3>

        {/* Social Proof Rating Row */}
        <div className="product-card-rating">
          <span
            className="card-stars"
            aria-label={`Rated ${avgRating} out of 5 stars`}
          >
            {"★".repeat(Math.round(avgRating))}
            {"☆".repeat(5 - Math.round(avgRating))}
          </span>
          <span className="card-rating-score">
            {avgRating > 0 ? avgRating.toFixed(1) : "New"}
          </span>
          {reviewCount > 0 && (
            <span className="card-review-count">({reviewCount})</span>
          )}
        </div>

        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        <div className="product-card-footer">
          {product.price > 0 ? (
            <span className="product-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          ) : (
            <span className="product-price-inquire">Price on Request</span>
          )}

          <button
            type="button"
            className="view-details"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            View Details →
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
