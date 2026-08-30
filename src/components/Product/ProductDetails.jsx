import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const getImageUrl = (imageUrl) => {
    return `https://krishna-musical-backend.onrender.com/${imageUrl.replace("../", "")}`;
  };

  useEffect(() => {
    axios
      .get(`https://krishna-musical-backend.onrender.com/api/products/${id}`)
      .then((response) => {
        setProduct(response.data.data);
      })
      .catch((err) => {
        console.log("Error fetching product:", err);
      });
  }, [id]);

  if (!product) {
    return (
      <div className="product-loading">
        <p>Loading product...</p>
      </div>
    );
  }
  console.log("Product images:", product.images?.length);
  const formatSpecificationValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object" && value !== null) {
      return Object.entries(value)
      .map(([key, val]) => `${key}: ${formatSpecificationValue(val)}`)
      .join(" · ");
    }
    
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    
    return value;
  };

  const formatSpecificationKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase());
  };

  

  return (
    <div className="product-details">
      <div className="product-gallery">
        <div className="main-image-container">
          <button
            className="carousel-btn prev"
            onClick={() =>
              setActiveImage(
                activeImage === 0 ? product.images.length - 1 : activeImage - 1,
              )
            }
          >
            ←
          </button>

          <img
            src={getImageUrl(product.images[activeImage].url)}
            alt={product.images[activeImage].alt || product.name}
          />

          <button
            className="carousel-btn next"
            onClick={() =>
              setActiveImage(
                activeImage === product.images.length - 1 ? 0 : activeImage + 1,
              )
            }
          >
            →
          </button>
        </div>

        <div className="product-thumbnails">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={getImageUrl(image.url)}
              alt={image.alt || product.name}
              className={activeImage === index ? "active" : ""}
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>
      </div>

      <div className="product-details-info">
        <p className="product-category">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <div className="product-brand">
            <h3>Brand</h3>
            <p>{product.brand || "Traditional / Unbranded"}</p>
          </div>

          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="product-specifications">
                <h3>Specifications</h3>

                <div className="specifications-list">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div className="specification-item" key={key}>
                        <span>{formatSpecificationKey(key)}</span>
                        <span>{formatSpecificationValue(value)}</span>
                      </div>
                    ),
                  )}
                  <div className="product-enquiry">
                    <h3>Interested in this instrument?</h3>
                    <p>
                      Contact us for availability, details, and further
                      assistance.
                    </p>

                    <button className="enquiry-btn">
                      Enquire About This Instrument
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
