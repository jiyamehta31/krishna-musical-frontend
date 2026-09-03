import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AdminProducts.css";

const API_BASE_URL =
  axios.defaults.baseURL ||
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const navigate = useNavigate();

  // Safely resolve image source (absolute CDN URLs vs. backend uploads)
  const getImageUrl = (product) => {
    if (!product?.images || product.images.length === 0) return null;
    const primary =
      product.images.find((img) => img.isPrimary) || product.images[0];
    if (!primary?.url) return null;

    if (
      primary.url.startsWith("http://") ||
      primary.url.startsWith("https://")
    ) {
      return primary.url;
    }
    const cleanPath = primary.url.startsWith("/")
      ? primary.url
      : `/${primary.url}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Manage Products | Krishna Musicals Admin";

    let isMounted = true;

    axios
      .get("/api/products")
      .then((res) => {
        if (!isMounted) return;
        setProducts(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load catalog products:", err);
        setActionError("Unable to fetch product inventory from server.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Derive unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set(
      products.map((p) => p.category?.trim()).filter(Boolean),
    );
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        p.category?.trim().toLowerCase() === selectedCategory.toLowerCase();

      const nameMatch = (p.name || "").toLowerCase().includes(query);
      const brandMatch = (p.brand || "").toLowerCase().includes(query);
      const catMatch = (p.category || "").toLowerCase().includes(query);

      return matchesCategory && (!query || nameMatch || brandMatch || catMatch);
    });
  }, [products, searchTerm, selectedCategory]);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Permanently delete "${name}" from the workshop catalog? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setActionError("");
      setActionSuccess("");

      await axios.delete(`/api/products/${id}`);

      setProducts((prev) => prev.filter((p) => p._id !== id));
      setActionSuccess(`"${name}" was successfully removed.`);
    } catch (err) {
      console.error("Delete product error:", err);
      setActionError(
        err.response?.data?.message ||
          "Failed to delete product from database.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="admin-products-page">
      {/* Page Header */}
      <header className="admin-products-header">
        <div>
          <div className="admin-breadcrumbs">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <span>Products</span>
          </div>
          <h1>Workshop Inventory</h1>
          <p>
            Review and manage all customer-facing instruments, pricing, and
            workshop stock.
          </p>
        </div>

        <button
          type="button"
          className="admin-add-product-btn"
          onClick={() => navigate("/admin/products/add")}
        >
          + Add New Instrument
        </button>
      </header>

      {/* Notifications */}
      {actionError && (
        <div className="admin-banner error" role="alert">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="admin-banner success" role="status">
          {actionSuccess}
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <section className="admin-toolbar-card">
        <div className="toolbar-search">
          <input
            type="text"
            placeholder="Search by instrument name, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="toolbar-clear-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="toolbar-filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-dropdown"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          <span className="results-count">
            Total: <strong>{filteredProducts.length}</strong> items
          </span>
        </div>
      </section>

      {/* Product List / Table */}
      <section className="admin-products-container">
        {loading ? (
          <div className="admin-state-card">
            <p>Loading workshop products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-state-card empty">
            <h3>No Instruments Found</h3>
            <p>
              {searchTerm || selectedCategory !== "All"
                ? "No products match your active search or category filters."
                : "No instruments currently exist in the database."}
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const imageUrl = getImageUrl(product);
                  const isDeleting = deletingId === product._id;
                  const isLowStock = Number(product.stock) <= 0;

                  return (
                    <tr
                      key={product._id}
                      className={isDeleting ? "row-deleting" : ""}
                    >
                      {/* Product Thumbnail & Details */}
                      <td className="table-product-cell">
                        <div className="table-img-frame">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.images?.[0]?.alt || product.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="table-img-fallback"
                            style={{ display: imageUrl ? "none" : "flex" }}
                          >
                            🎵
                          </div>
                        </div>
                        <div className="table-product-info">
                          <strong>{product.name}</strong>
                          <span>{product.brand || "Krishna Musicals"}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="category-tag">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="price-cell">
                        {product.price > 0
                          ? `₹${Number(product.price).toLocaleString("en-IN")}`
                          : "On Request"}
                      </td>

                      {/* Stock Level */}
                      <td>
                        <span
                          className={`stock-badge ${isLowStock ? "out-of-stock" : ""}`}
                        >
                          {product.stock ?? "N/A"} in stock
                        </span>
                      </td>

                      {/* Visibility Status */}
                      <td>
                        <span
                          className={`status-pill ${
                            product.status === "inactive"
                              ? "inactive"
                              : "active"
                          }`}
                        >
                          {product.status === "inactive" ? "Draft" : "Active"}
                        </span>
                      </td>

                      {/* Action Controls */}
                      <td className="actions-col">
                        <div className="actions-cluster">
                          <button
                            type="button"
                            className="btn-action edit"
                            disabled={isDeleting}
                            onClick={() =>
                              navigate(`/admin/products/edit/${product._id}`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-action delete"
                            disabled={isDeleting}
                            onClick={() =>
                              handleDelete(product._id, product.name)
                            }
                          >
                            {isDeleting ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminProducts;
