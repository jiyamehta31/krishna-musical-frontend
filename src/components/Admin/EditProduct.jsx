import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../../api/axios";
import { getOptimizedImageUrl } from "../../utils/media";
import "./EditProduct.css"
;

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

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const errorRef = useRef(null); // Ref for error auto-scroll

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subCategory: "",
    brand: "Krishna Musicals",
    description: "",
    price: "",
    stock: "1",
    status: "active",
    instagramId: "",
    instagramUrl: "",
    isInstagram: false,
  });

  const [specs, setSpecs] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [coverSelection, setCoverSelection] = useState({
    type: "existing",
    index: 0,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Edit Instrument | Krishna Musicals Admin";

    let isMounted = true;

    API.get(`/products/${id}`)
      .then((response) => {
        if (!isMounted) return;
        const product =
          response.data?.data || response.data?.product || response.data;

        if (!product) {
          setErrorMessage("Instrument details could not be found.");
          setLoading(false);
          return;
        }

        setFormData({
          name: product.name || "",
          category: product.category || "",
          subCategory: product.subCategory || "",
          brand: product.brand || "Krishna Musicals",
          description: product.description || "",
          price:
            product.price && product.price > 0 ? String(product.price) : "",
          stock: product.stock !== undefined ? String(product.stock) : "1",
          status: product.status || "active",
          instagramId: product.instagramId || "",
          instagramUrl: product.instagramUrl || "",
          isInstagram: Boolean(product.isInstagram),
        });

        let parsedSpecs = [];
        if (product.specifications) {
          let specObj = product.specifications;
          if (typeof specObj === "string") {
            try {
              specObj = JSON.parse(specObj);
            } catch {
              specObj = {};
            }
          }
          if (typeof specObj === "object" && specObj !== null) {
            parsedSpecs = Object.entries(specObj).map(([key, val]) => ({
              key,
              value: String(val),
            }));
          }
        }

        setSpecs(
          parsedSpecs.length > 0
            ? parsedSpecs
            : [
                { key: "Wood Type", value: "" },
                { key: "Tuning Pitch", value: "A440Hz" },
              ],
        );

        const fetchedImages = Array.isArray(product.images)
          ? product.images
          : [];
        setExistingImages(fetchedImages);

        const primaryIdx = fetchedImages.findIndex((img) => img.isPrimary);
        setCoverSelection({
          type: "existing",
          index: primaryIdx >= 0 ? primaryIdx : 0,
        });

        setLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(
          error.response?.data?.message || "Failed to load instrument details.",
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Auto-scroll to error and auto-dismiss after 7 seconds
  useEffect(() => {
    if (!errorMessage) return;

    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 7000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [newImages]);

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

    if (!formData.category.trim()) {
      setErrorMessage("Please select or enter a valid category.");
      return;
    }

    setSubmitting(true);

    const cleanSpecifications = {};
    specs.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        cleanSpecifications[item.key.trim()] = item.value.trim();
      }
    });

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("category", formData.category.trim());
    data.append("subCategory", formData.subCategory.trim());
    data.append("brand", formData.brand.trim());
    data.append("description", formData.description.trim());
    data.append("price", formData.price !== "" ? Number(formData.price) : 0);
    data.append("stock", Number(formData.stock) || 0);
    data.append("status", formData.status);
    data.append("specifications", JSON.stringify(cleanSpecifications));
    data.append("retainedImages", JSON.stringify(existingImages));
    data.append("coverType", coverSelection.type);
    data.append("coverIndex", coverSelection.index);

    if (formData.instagramId.trim()) {
      data.append("instagramId", formData.instagramId.trim());
    }
    if (formData.instagramUrl.trim()) {
      data.append("instagramUrl", formData.instagramUrl.trim());
    }
    data.append("isInstagram", String(formData.isInstagram));

    newImages.forEach((imgObj) => {
      data.append("images", imgObj.file);
    });

    try {
      await API.put(`/products/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Instrument updated successfully! Redirecting...");
      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (error) {
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update instrument specifications.";
      setErrorMessage(serverMsg);
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
        <header className="edit-product-header">
          <div className="admin-breadcrumbs">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <Link to="/admin/products">Products</Link>
            <span>/</span>
            <span>Edit</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Edit Instrument</h1>
            {formData.isInstagram && (
              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "rgba(200, 157, 92, 0.15)",
                  color: "var(--gold-primary, #c89d5c)",
                  fontWeight: "700",
                  border: "1px solid rgba(200, 157, 92, 0.35)",
                }}
              >
                📸 Synced Instagram Post
              </span>
            )}
          </div>
          <p>
            Modify specifications, stock availability, pricing, or photographs.
          </p>
        </header>

        {/* Dynamic Flash Alert with Close Button and Ref */}
        {errorMessage && (
          <div ref={errorRef} className="form-alert error-banner" role="alert">
            <span className="alert-text">{errorMessage}</span>
            <button
              type="button"
              className="alert-dismiss-btn"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="form-alert success-banner" role="status">
            {successMessage}
          </div>
        )}

        <form className="edit-product-form" onSubmit={handleSubmit}>
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

            <div className="form-row three-col">
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
                <label htmlFor="edit-subcategory">Sub-Category</label>
                <input
                  id="edit-subcategory"
                  type="text"
                  placeholder="e.g. Folding Harmonium, Concert Sitar"
                  value={formData.subCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategory: e.target.value })
                  }
                  disabled={submitting}
                />
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
              <label htmlFor="edit-description">Acoustic Description *</label>
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

          <div className="form-card">
            <h2>Showroom &amp; Social Integration</h2>
            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="edit-instagram-id">Instagram Post ID</label>
                <input
                  id="edit-instagram-id"
                  type="text"
                  placeholder="e.g. 18023948572019483"
                  value={formData.instagramId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instagramId: e.target.value,
                      isInstagram: Boolean(
                        e.target.value.trim() || formData.instagramUrl.trim(),
                      ),
                    })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-instagram-url">Instagram Post Link</label>
                <input
                  id="edit-instagram-url"
                  type="url"
                  placeholder="https://www.instagram.com/p/..."
                  value={formData.instagramUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instagramUrl: e.target.value,
                      isInstagram: Boolean(
                        e.target.value.trim() || formData.instagramId.trim(),
                      ),
                    })
                  }
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-header">
              <h2>Technical Specifications</h2>
              <button
                type="button"
                className="add-spec-btn"
                onClick={() => addSpecRow()}
                disabled={submitting}
              >
                + Add Spec Field
              </button>
            </div>

            <p className="image-upload-info">
              Manage technical attributes displayed on the storefront
              specifications table.
            </p>

            <div className="spec-presets-row">
              <span className="preset-label">Quick suggestions:</span>
              {SPEC_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="preset-chip"
                  onClick={() => addSpecRow(preset)}
                  disabled={submitting}
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
                    disabled={submitting}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Seasoned Burma Teak)"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(idx, "value", e.target.value)
                    }
                    className="spec-val-input"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="remove-spec-btn"
                    onClick={() => removeSpecRow(idx)}
                    title="Remove specification"
                    aria-label="Remove specification"
                    disabled={submitting}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-card">
            <h2>Inventory &amp; Pricing</h2>

            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="edit-price">Price (₹ INR) — Optional</label>
                <input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Leave empty for 'Price on Request'"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-stock">Available Units</label>
                <input
                  id="edit-stock"
                  type="number"
                  min="0"
                  placeholder="1"
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

            <div className="preview-grid">
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
                      src={getOptimizedImageUrl(img.url, { width: 300 })}
                      alt={img.alt || `Saved image ${index + 1}`}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/images/placeholder-instrument.jpg";
                      }}
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
                    {/* <span className="new-badge">New</span> */}
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
}
