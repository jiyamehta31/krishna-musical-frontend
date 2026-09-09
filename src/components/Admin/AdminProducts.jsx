import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { getOptimizedImageUrl, getPrimaryImage } from "../../utils/media";
import "./AdminProducts.css"
;

const INSTAGRAM_FEED_URL =
  import.meta.env.VITE_INSTAGRAM_FEED_URL ||
  "https://feeds.behold.so/xzK6rxt0HtOb3FvyCdHg";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Manage Products | Krishna Musicals Admin";

    let isMounted = true;

    API.get("/products")
      .then((res) => {
        if (!isMounted) return;
        const payload = res.data;
        let list = [];
        if (Array.isArray(payload)) {
          list = payload;
        } else if (payload && typeof payload === "object") {
          list =
            payload.data ||
            payload.products ||
            payload.items ||
            Object.values(payload).find(Array.isArray) ||
            [];
        }
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setActionError("Unable to fetch product inventory from server.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSyncInstagram = async () => {
    try {
      setSyncing(true);
      setActionError("");
      setActionSuccess("");

      const res = await fetch(INSTAGRAM_FEED_URL);
      if (!res.ok) {
        throw new Error(`Instagram feed error: ${res.status}`);
      }
      const data = await res.json();

      const rawPosts = Array.isArray(data)
        ? data
        : Array.isArray(data?.posts)
          ? data.posts
          : [];

      if (rawPosts.length === 0) {
        setActionError("No posts found in the Instagram feed.");
        return;
      }

      const mappedPosts = rawPosts.map((post) => {
        const rawCaption = (post.caption || "Showroom Instrument").trim();
        const captionFirstLine = rawCaption.split("\n")[0].slice(0, 80);
        const imageUrl =
          post.mediaUrl ||
          post.thumbnailUrl ||
          post.sizes?.large?.mediaUrl ||
          post.sizes?.medium?.mediaUrl;

        return {
          name: captionFirstLine || "Showroom Instrument",
          description:
            rawCaption ||
            "Live handcrafted instrument showcase from Krishna Musicals workshop.",
          price: 0,
          category: "Other Instruments",
          subCategory: "Showroom Showcase",
          brand: "Krishna Musicals",
          stock: 1,
          instagramId: String(post.id),
          instagramUrl: post.permalink || "",
          images: imageUrl
            ? [
                {
                  url: imageUrl,
                  alt: captionFirstLine || "Instagram Showroom Instrument",
                  isPrimary: true,
                },
              ]
            : [
                {
                  url: "/images/placeholder-instrument.jpg",
                  alt: "Showroom Instrument",
                  isPrimary: true,
                },
              ],
        };
      });

      const syncRes = await API.post("/products/sync-instagram", {
        posts: mappedPosts,
      });

      if (syncRes.data?.data) {
        setProducts(syncRes.data.data);
      }
      setActionSuccess(
        syncRes.data?.message || "Instagram posts synced successfully!",
      );
    } catch (err) {
      console.error("Instagram sync error:", err);
      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Failed to sync Instagram items with database.",
      );
    } finally {
      setSyncing(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(
      products.map((p) => p.category?.trim()).filter(Boolean),
    );
    return ["All", ...Array.from(set)];
  }, [products]);

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

      await API.delete(`/products/${id}`);

      setProducts((prev) => prev.filter((p) => p._id !== id));
      setActionSuccess(`"${name}" was successfully removed.`);
    } catch (err) {
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

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-sync-btn"
            onClick={handleSyncInstagram}
            disabled={syncing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid var(--gold-primary, #c89d5c)",
              background: "transparent",
              color: "var(--gold-primary, #c89d5c)",
              fontWeight: "600",
              cursor: syncing ? "not-allowed" : "pointer",
              opacity: syncing ? 0.7 : 1,
            }}
          >
            📸 {syncing ? "Syncing Feed..." : "Sync Instagram Posts"}
          </button>

          <button
            type="button"
            className="admin-add-product-btn"
            onClick={() => navigate("/admin/products/add")}
          >
            + Add New Instrument
          </button>
        </div>
      </header>

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
              ✕
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
                  const primaryImage = getPrimaryImage(product.images);
                  const imageUrl = primaryImage
                    ? getOptimizedImageUrl(primaryImage.url, { width: 120 })
                    : null;
                  const isDeleting = deletingId === product._id;
                  const isLowStock = Number(product.stock) <= 0;

                  return (
                    <tr
                      key={product._id}
                      className={isDeleting ? "row-deleting" : ""}
                      onClick={() => navigate(`/products/${product._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="table-product-cell">
                        <div className="table-img-frame">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={primaryImage?.alt || product.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display =
                                    "flex";
                                }
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <strong>{product.name}</strong>
                            {product.isInstagram && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "rgba(200, 157, 92, 0.15)",
                                  color: "var(--gold-primary, #c89d5c)",
                                  fontWeight: "700",
                                }}
                                title="Imported from Instagram showroom"
                              >
                                IG
                              </span>
                            )}
                          </div>
                          <span>{product.brand || "Krishna Musicals"}</span>
                        </div>
                      </td>

                      <td>
                        <span className="category-tag">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      <td className="price-cell">
                        {product.price > 0
                          ? `₹${Number(product.price).toLocaleString("en-IN")}`
                          : "On Request"}
                      </td>

                      <td>
                        <span
                          className={`stock-badge ${
                            isLowStock ? "out-of-stock" : ""
                          }`}
                        >
                          {product.stock ?? "N/A"} in stock
                        </span>
                      </td>

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

                      <td
                        className="actions-col"
                        onClick={(e) => e.stopPropagation()}
                      >
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
}
