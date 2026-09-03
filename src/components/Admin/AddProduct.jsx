import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AddProduct.css";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;

const STANDARD_CATEGORIES = [
  "Harmonium",
  "Classical Sitar",
  "Tabla Pair",
  "Tanpura",
  "Flute / Bansuri",
  "Dholak",
  "Santoor",
  "Strings & Accessories",
];

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "Krishna Musicals",
    description: "",
    price: "",
    stock: "1",
    status: "active",
  });

  // Array of { file: File, previewUrl: string, id: string }
  const [images, setImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Add Instrument | Krishna Musicals Admin";
  }, []);

  // Clean up object URLs on unmount to prevent browser memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const handleImageChange = (e) => {
    setErrorMessage("");
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setErrorMessage(
        `You can upload a maximum of ${MAX_IMAGES} images total.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const oversized = selectedFiles.find(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024,
    );

    if (oversized) {
      setErrorMessage(
        `"${oversized.name}" exceeds the ${MAX_FILE_SIZE_MB}MB file size limit.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Generate local preview URLs
    const newImages = selectedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove) => {
    const target = images[indexToRemove];
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }

    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updated);

    if (coverIndex >= updated.length) {
      setCoverIndex(Math.max(0, updated.length - 1));
    }
  };

  const makeCover = (index) => {
    setCoverIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (images.length === 0) {
      setErrorMessage(
        "Please select at least one photograph of the instrument.",
      );
      return;
    }

    setLoading(true);

    // Order images so the selected cover image is appended first
    const reorderedImages = [...images];
    if (coverIndex > 0 && coverIndex < reorderedImages.length) {
      const [coverItem] = reorderedImages.splice(coverIndex, 1);
      reorderedImages.unshift(coverItem);
    }

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("category", formData.category.trim());
    data.append("brand", formData.brand.trim());
    data.append("description", formData.description.trim());
    data.append("price", Number(formData.price) || 0);
    data.append("stock", Number(formData.stock) || 0);
    data.append("status", formData.status);

    reorderedImages.forEach((imgObj) => {
      data.append("images", imgObj.file);
    });

    try {
      // Axios interceptor handles BaseURL and Bearer Authorization automatically
      await axios.post("/api/products", data);

      setSuccessMessage(
        "Instrument added to catalog successfully! Redirecting...",
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (error) {
      console.error("Error adding product:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save instrument. Please verify all required fields.",
      );
      setLoading(false);
    }
  };

  return (
    <main className="add-product-page">
      <div className="add-product-container">
        {/* Navigation Breadcrumb & Header */}
        <header className="add-product-header">
          <div className="admin-breadcrumbs">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <Link to="/admin/products">Products</Link>
            <span>/</span>
            <span>New</span>
          </div>
          <h1>Add New Instrument</h1>
          <p>
            Register handcrafted or branded instruments into the workshop
            catalog.
          </p>
        </header>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="form-alert error-banner" role="alert">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="form-alert success-banner" role="status">
            {successMessage}
          </div>
        )}

        <form className="add-product-form" onSubmit={handleSubmit}>
          {/* Instrument Identification */}
          <div className="form-card">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="product-name">Instrument Name *</label>
              <input
                id="product-name"
                type="text"
                placeholder="e.g. 9-Scale Teak Wood Folding Harmonium"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-category">Category *</label>
                <input
                  id="product-category"
                  list="category-suggestions"
                  type="text"
                  placeholder="Select or enter category..."
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disabled={loading}
                  required
                />
                <datalist id="category-suggestions">
                  {STANDARD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label htmlFor="product-brand">Brand / Maker</label>
                <input
                  id="product-brand"
                  type="text"
                  placeholder="Krishna Musicals, Bina, Yamaha..."
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="product-description">
                Acoustic Description & Specifications *
              </label>
              <textarea
                id="product-description"
                rows={5}
                placeholder="Specify reed setup (Bass-Male), seasoned Burma teak details, bellows fold count, copper tuning pitch (A440Hz), and included padded carry bag..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Pricing, Inventory & Visibility */}
          <div className="form-card">
            <h2>Inventory & Pricing</h2>

            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="product-price">Price (₹ INR) *</label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="24500"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-stock">
                  Available Units in Workshop
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  placeholder="1"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-status">Catalog Status</label>
                <select
                  id="product-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  disabled={loading}
                >
                  <option value="active">Active (Visible in Store)</option>
                  <option value="inactive">Draft / Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Uploads with Visual Previews */}
          <div className="form-card">
            <div className="form-card-header">
              <h2>Instrument Photographs *</h2>
              <span className="image-counter">
                {images.length} of {MAX_IMAGES} uploaded
              </span>
            </div>

            <p className="image-upload-info">
              Upload clear workshop photos (JPG, PNG, WebP up to 5MB). The
              photograph marked with <strong>Cover Image</strong> will appear as
              the storefront thumbnail.
            </p>

            <div className="upload-dropzone">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                disabled={loading || images.length >= MAX_IMAGES}
                className="file-input-hidden"
              />
              <label htmlFor="file-upload" className="file-upload-trigger">
                <span className="upload-icon">📷</span>
                <span>Click to select photographs from computer</span>
                <span className="upload-sub">
                  Supports multi-file selection
                </span>
              </label>
            </div>

            {/* Thumbnail Preview Grid */}
            {images.length > 0 && (
              <div className="preview-grid">
                {images.map((img, index) => {
                  const isCover = coverIndex === index;
                  return (
                    <div
                      key={img.id}
                      className={`preview-card ${isCover ? "is-cover" : ""}`}
                    >
                      <img
                        src={img.previewUrl}
                        alt={`Upload preview ${index + 1}`}
                      />

                      <div className="preview-overlay">
                        {isCover ? (
                          <span className="cover-badge">★ Cover</span>
                        ) : (
                          <button
                            type="button"
                            className="set-cover-btn"
                            onClick={() => makeCover(index)}
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeImage(index)}
                          aria-label="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions-bar">
            <button
              type="button"
              className="cancel-btn"
              disabled={loading}
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? "Registering Instrument..."
                : "Save & Publish Instrument"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddProduct;
