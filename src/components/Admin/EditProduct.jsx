import { useEffect, useState, useRef} from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "./EditProduct.css";

const API_BASE_URL =
  axios.defaults.baseURL ||
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    stock: "0",
    status: "active",
  });

  // Existing images fetched from server: [{ _id, url, isPrimary, alt }]
  const [existingImages, setExistingImages] = useState([]);
  // New images selected in current session: [{ file, previewUrl, id }]
  const [newImages, setNewImages] = useState([]);

  const [coverSelection, setCoverSelection] = useState({
    type: "existing", // "existing" | "new"
    index: 0,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formatImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Edit Instrument | Krishna Musicals Admin";

    let isMounted = true;

    axios
      .get(`/api/products/${id}`)
      .then((response) => {
        if (!isMounted) return;
        const product = response.data?.data;

        if (!product) {
          setErrorMessage("Instrument details could not be found.");
          setLoading(false);
          return;
        }

        setFormData({
          name: product.name || "",
          category: product.category || "",
          brand: product.brand || "Krishna Musicals",
          description: product.description || "",
          price: product.price ?? "",
          stock: product.stock ?? "0",
          status: product.status || "active",
        });

        const fetchedImages = product.images || [];
        setExistingImages(fetchedImages);

        // Identify primary cover image
        const primaryIdx = fetchedImages.findIndex((img) => img.isPrimary);
        setCoverSelection({
          type: "existing",
          index: primaryIdx >= 0 ? primaryIdx : 0,
        });

        setLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Error fetching instrument:", error);
        setErrorMessage(
          error.response?.data?.message || "Failed to load instrument details.",
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Clean up object URLs on unmount to prevent browser memory leaks
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [newImages]);

  const totalImageCount = existingImages.length + newImages.length;

  const handleNewImageChange = (e) => {
    setErrorMessage("");
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (totalImageCount + selectedFiles.length > MAX_IMAGES) {
      setErrorMessage(
        `A product can have a maximum of ${MAX_IMAGES} images in total.`,
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

    const queued = selectedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));

    setNewImages((prev) => [...prev, ...queued]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (indexToRemove) => {
    if (existingImages.length + newImages.length <= 1) {
      setErrorMessage("Instruments must have at least one photograph.");
      return;
    }

    const updated = existingImages.filter((_, idx) => idx !== indexToRemove);
    setExistingImages(updated);

    if (
      coverSelection.type === "existing" &&
      coverSelection.index === indexToRemove
    ) {
      setCoverSelection({ type: "existing", index: 0 });
    } else if (
      coverSelection.type === "existing" &&
      coverSelection.index > indexToRemove
    ) {
      setCoverSelection((prev) => ({ ...prev, index: prev.index - 1 }));
    }
  };

  const removeNewImage = (indexToRemove) => {
    const target = newImages[indexToRemove];
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }

    const updated = newImages.filter((_, idx) => idx !== indexToRemove);
    setNewImages(updated);

    if (
      coverSelection.type === "new" &&
      coverSelection.index === indexToRemove
    ) {
      setCoverSelection({ type: "existing", index: 0 });
    } else if (
      coverSelection.type === "new" &&
      coverSelection.index > indexToRemove
    ) {
      setCoverSelection((prev) => ({ ...prev, index: prev.index - 1 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (totalImageCount === 0) {
      setErrorMessage("At least one product photograph is required.");
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("category", formData.category.trim());
    data.append("brand", formData.brand.trim());
    data.append("description", formData.description.trim());
    data.append("price", Number(formData.price) || 0);
    data.append("stock", Number(formData.stock) || 0);
    data.append("status", formData.status);

    // Send the retained existing images so the server knows which to keep
    data.append("retainedImages", JSON.stringify(existingImages));

    // Cover image metadata
    data.append("coverType", coverSelection.type);
    data.append("coverIndex", coverSelection.index);

    // Append newly uploaded image files
    newImages.forEach((imgObj) => {
      data.append("images", imgObj.file);
    });

    try {
      await axios.put(`/api/products/${id}`, data);

      setSuccessMessage("Instrument updated successfully! Redirecting...");
      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (error) {
      console.error("Error updating instrument:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update instrument specifications.",
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="edit-product-page">
        <div className="edit-product-container">
          <div className="admin-state-card">
            <p>Loading instrument details...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-product-page">
      <div className="edit-product-container">
        {/* Navigation Breadcrumbs & Header */}
        <header className="edit-product-header">
          <div className="admin-breadcrumbs">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <Link to="/admin/products">Products</Link>
            <span>/</span>
            <span>Edit</span>
          </div>
          <h1>Edit Instrument</h1>
          <p>
            Modify specifications, stock availability, pricing, or photographs.
          </p>
        </header>

        {/* Notifications */}
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

        <form className="edit-product-form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-card">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="edit-name">Instrument Name *</label>
              <input
                id="edit-name"
                type="text"
                placeholder="Instrument name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-category">Category *</label>
                <input
                  id="edit-category"
                  list="edit-category-suggestions"
                  type="text"
                  placeholder="Select or enter category..."
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disabled={submitting}
                  required
                />
                <datalist id="edit-category-suggestions">
                  {STANDARD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label htmlFor="edit-brand">Brand / Maker</label>
                <input
                  id="edit-brand"
                  type="text"
                  placeholder="e.g. Krishna Musicals, Bina, Yamaha"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">
                Acoustic Description & Specifications *
              </label>
              <textarea
                id="edit-description"
                rows={5}
                placeholder="Wood grade, scale adjustments, reed specifications..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Pricing, Inventory & Status */}
          <div className="form-card">
            <h2>Inventory & Pricing</h2>

            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="edit-price">Price (₹ INR) *</label>
                <input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="24500"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-stock">Available Units</label>
                <input
                  id="edit-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-status">Catalog Status</label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  disabled={submitting}
                >
                  <option value="active">Active (Visible in Store)</option>
                  <option value="inactive">Draft / Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Photographs Management */}
          <div className="form-card">
            <div className="form-card-header">
              <h2>Instrument Photographs</h2>
              <span className="image-counter">
                {totalImageCount} of {MAX_IMAGES} total
              </span>
            </div>

            <p className="image-upload-info">
              Manage saved images or upload replacements. The photograph marked
              with <strong>Cover Image</strong> represents this instrument
              across the storefront.
            </p>

            {/* Combined Images Gallery */}
            <div className="preview-grid">
              {/* 1. Existing Saved Images */}
              {existingImages.map((img, index) => {
                const isCover =
                  coverSelection.type === "existing" &&
                  coverSelection.index === index;

                return (
                  <div
                    key={img._id || `existing-${index}`}
                    className={`preview-card ${isCover ? "is-cover" : ""}`}
                  >
                    <img
                      src={formatImageUrl(img.url)}
                      alt={img.alt || `Saved image ${index + 1}`}
                    />
                    <div className="preview-overlay">
                      {isCover ? (
                        <span className="cover-badge">★ Cover</span>
                      ) : (
                        <button
                          type="button"
                          className="set-cover-btn"
                          onClick={() =>
                            setCoverSelection({ type: "existing", index })
                          }
                        >
                          Set Cover
                        </button>
                      )}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeExistingImage(index)}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* 2. Newly Queued Images */}
              {newImages.map((img, index) => {
                const isCover =
                  coverSelection.type === "new" &&
                  coverSelection.index === index;

                return (
                  <div
                    key={img.id}
                    className={`preview-card is-new ${isCover ? "is-cover" : ""}`}
                  >
                    <img
                      src={img.previewUrl}
                      alt={`New upload preview ${index + 1}`}
                    />
                    <span className="new-badge">New</span>
                    <div className="preview-overlay">
                      {isCover ? (
                        <span className="cover-badge">★ Cover</span>
                      ) : (
                        <button
                          type="button"
                          className="set-cover-btn"
                          onClick={() =>
                            setCoverSelection({ type: "new", index })
                          }
                        >
                          Set Cover
                        </button>
                      )}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeNewImage(index)}
                        aria-label="Remove queued image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dropzone for Additional Uploads */}
            {totalImageCount < MAX_IMAGES && (
              <div className="upload-dropzone" style={{ marginTop: "20px" }}>
                <input
                  ref={fileInputRef}
                  id="edit-file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleNewImageChange}
                  disabled={submitting}
                  className="file-input-hidden"
                />
                <label
                  htmlFor="edit-file-upload"
                  className="file-upload-trigger"
                >
                  <span className="upload-icon">📷</span>
                  <span>
                    Click to add more photographs (
                    {MAX_IMAGES - totalImageCount} remaining)
                  </span>
                  <span className="upload-sub">
                    Supports JPG, PNG, and WebP (up to 5MB)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions-bar">
            <button
              type="button"
              className="cancel-btn"
              disabled={submitting}
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Saving Changes..." : "Update Instrument"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditProduct;
