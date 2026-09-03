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

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/products/${product._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/products/${product._id}`);
        }
      }}
    >
      <div className="product-image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            loading="lazy"
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
              navigate(`/products/${product._id}`);
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
