import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product }) => {

  const navigate = useNavigate();
  const getImageUrl = (imageUrl) => {
    return `https://krishna-musical-backend-1.onrender.com/${imageUrl.replace("../", "")}`;
  };

  return (
    <div className="product-card">
      {product.images?.length > 0 && (
        <div className="product-image-container">
          <img
            src={getImageUrl(product.images[0].url)}
            alt={product.images[0].alt || product.name}
          />
        </div>
      )}

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h2>{product.name}</h2>

        <p className="product-description">{product.description}</p>

        <button
          className="view-details"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
