import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AddProduct.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;

const STANDARD_CATEGORIES = [
  "Harmonium",
  "Sitar",
  "Tabla",
  "Tanpura",
  "Guitars",
  "Keyboards & Pianos",
  "Drums & Percussion",
  "Wind & Brass",
  "Indian Classical",
  "School Items",
  "Other Instruments",
  "Accessories",
];

const SPEC_PRESETS = [
  "Wood Type",
  "Tuning Pitch",
  "Reed Setup",
  "Bellows Count",
  "Scale / Keys",
  "Material",
  "Included Accessories",
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

  // Dynamic specifications state
  const [specs, setSpecs] = useState([
    { key: "Wood Type", value: "" },
    { key: "Tuning Pitch", value: "A440Hz" },
  ]);

  const [images, setImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Add Instrument | Krishna Musicals Admin";
  }, []);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const handleSpecChange = (index, field, val) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const addSpecRow = (presetKey = "") => {
    setSpecs((prev) => [...prev, { key: presetKey, value: "" }]);
  };

  const removeSpecRow = (indexToRemove) => {
    setSpecs((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

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

    if (!formData.category.trim()) {
      setErrorMessage("Please select or enter a valid category.");
      return;
    }

    setLoading(true);

    const reorderedImages = [...images];
    if (coverIndex > 0 && coverIndex < reorderedImages.length) {
      const [coverItem] = reorderedImages.splice(coverIndex, 1);
      reorderedImages.unshift(coverItem);
    }

    // Convert dynamic rows into a key-value object
    const cleanSpecifications = {};
    specs.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        cleanSpecifications[item.key.trim()] = item.value.trim();
      }
    });

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("category", formData.category.trim());
    data.append("brand", formData.brand.trim());
    data.append("description", formData.description.trim());
    data.append("price", formData.price ? Number(formData.price) : 0);
    data.append("stock", Number(formData.stock) || 0);
    data.append("status", formData.status);
    data.append("specifications", JSON.stringify(cleanSpecifications));

    reorderedImages.forEach((imgObj) => {
      data.append("images", imgObj.file);
    });

    const token = localStorage.getItem("token");

    try {
      await axios.post(`${API_BASE_URL}/api/products`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setSuccessMessage(
        "Instrument added to catalog successfully! Redirecting...",
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (error) {
      console.error("Error adding product:", error);

      const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.status === 404
          ? "API Endpoint not found. Please verify the backend URL."
          : error.response?.status === 401 || error.response?.status === 403
            ? "Unauthorized. Please log into admin again."
            : "Failed to save instrument. Please verify all fields.");

      setErrorMessage(serverMsg);
      setLoading(false);
    }
  };

  return (
    <main className="add-product-page">
      <div className="add-product-container">
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
          {/* Basic Information */}
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

          {/* Technical Specifications */}
          <div className="form-card">
            <div className="form-card-header">
              <h2>Technical Specifications</h2>
              <button
                type="button"
                className="add-spec-btn"
                onClick={() => addSpecRow()}
                disabled={loading}
              >
                + Add Spec Field
              </button>
            </div>

            <p className="image-upload-info">
              Add key-value details shown in the technical specifications table
              on the product page.
            </p>

            <div className="spec-presets-row">
              <span className="preset-label">Quick suggestions:</span>
              {SPEC_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="preset-chip"
                  onClick={() => addSpecRow(preset)}
                  disabled={loading}
                >
                  + {preset}
                </button>
              ))}
            </div>

            <div className="specifications-builder">
              {specs.map((spec, idx) => (
                <div className="spec-row" key={idx}>
                  <input
                    type="text"
                    placeholder="Attribute (e.g. Wood Type)"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(idx, "key", e.target.value)
                    }
                    className="spec-key-input"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Seasoned Teak)"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(idx, "value", e.target.value)
                    }
                    className="spec-val-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="remove-spec-btn"
                    onClick={() => removeSpecRow(idx)}
                    title="Remove specification"
                    aria-label="Remove specification"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory & Pricing */}
          <div className="form-card">
            <h2>Inventory & Pricing</h2>

            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="product-price">Price (₹ INR)</label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Leave empty for 'Price on Request'"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={loading}
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

          {/* Images */}
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
