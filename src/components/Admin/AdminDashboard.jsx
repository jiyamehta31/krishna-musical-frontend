import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/authContextDef";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Admin Dashboard | Krishna Musicals";

    let isMounted = true;

    API.get("/products")
      .then((res) => {
        if (!isMounted) return;
        const list =
          res.data?.data ||
          res.data?.products ||
          (Array.isArray(res.data) ? res.data : []);
        setProducts(list);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to sync catalog metrics. Please check server status.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status !== "inactive").length;
    const inactive = total - active;
    const outOfStock = products.filter((p) => Number(p.stock) <= 0).length;
    const categories = new Set(
      products.map((p) => p.category?.trim()).filter(Boolean),
    );

    return {
      total,
      active,
      inactive,
      outOfStock,
      categoriesCount: categories.size,
    };
  }, [products]);

 const handleLogout = () => {
   logout();
   window.location.replace("/admin/login");
 };

  return (
    <main className="admin-dashboard-page">
      <header className="admin-header">
        <div className="admin-header-text">
          <span className="admin-pill">WORKSHOP MANAGEMENT</span>
          <h1>Inventory Dashboard</h1>
          <p>
            Welcome back{user?.username ? `, ${user.username}` : ""}! Monitor
            workshop stock, instrument pricing, and catalog visibility.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="view-store-btn"
          >
            View Live Store ↗
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-logout-btn"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-dashboard-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-label">Total Instruments</span>
          <h2 className="stat-number">{loading ? "..." : metrics.total}</h2>
          <p className="stat-desc">Entire workshop database</p>
        </div>

        <div className="admin-stat-card active-card">
          <span className="stat-label">Active in Store</span>
          <h2 className="stat-number">{loading ? "..." : metrics.active}</h2>
          <p className="stat-desc">Visible to customers</p>
        </div>

        <div className="admin-stat-card warning-card">
          <span className="stat-label">Stock Required</span>
          <h2 className="stat-number">
            {loading ? "..." : metrics.outOfStock}
          </h2>
          <p className="stat-desc">Out of stock / Made to order</p>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">Categories</span>
          <h2 className="stat-number">
            {loading ? "..." : metrics.categoriesCount}
          </h2>
          <p className="stat-desc">Harmoniums, Sitars, Tablas...</p>
        </div>
      </section>

      <section className="admin-quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="admin-actions-grid">
          <button
            type="button"
            className="action-btn primary"
            onClick={() => navigate("/admin/products/add")}
          >
            <span className="action-icon">+</span>
            <div>
              <strong>Add New Instrument</strong>
              <p>Upload photos, specifications, and pricing</p>
            </div>
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => navigate("/admin/products")}
          >
            <span className="action-icon">📋</span>
            <div>
              <strong>Manage Products</strong>
              <p>Edit stock, change visibility, or remove listings</p>
            </div>
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => navigate("/offers")}
          >
            <span className="action-icon">🏷️</span>
            <div>
              <strong>Review Store Offers</strong>
              <p>Check active customer promotions</p>
            </div>
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => navigate("/products")}
          >
            <span className="action-icon">🔍</span>
            <div>
              <strong>Browse Customer Catalog</strong>
              <p>View the customer search and filter view</p>
            </div>
          </button>
        </div>
      </section>

      <section className="admin-recent-section">
        <div className="recent-header">
          <h2>Recently Registered Instruments</h2>
          <Link to="/admin/products" className="view-all-link">
            View All ({products.length}) →
          </Link>
        </div>

        {loading ? (
          <p className="dashboard-loading">Loading recent items...</p>
        ) : products.length === 0 ? (
          <div className="dashboard-empty">
            <p>No instruments listed yet in the workshop catalog.</p>
            <button
              type="button"
              className="dashboard-add-cta"
              onClick={() => navigate("/admin/products/add")}
            >
              Add First Instrument
            </button>
          </div>
        ) : (
          <div className="recent-table-wrapper">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((item) => (
                  <tr key={item._id}>
                    <td className="product-cell">
                      <strong>{item.name}</strong>
                      {item.brand && <span>{item.brand}</span>}
                    </td>
                    <td>{item.category || "Uncategorized"}</td>
                    <td>
                      {item.price > 0
                        ? `₹${Number(item.price).toLocaleString("en-IN")}`
                        : "On Request"}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          item.status === "inactive" ? "inactive" : "active"
                        }`}
                      >
                        {item.status === "inactive" ? "Draft" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="table-edit-btn"
                        onClick={() =>
                          navigate(`/admin/products/edit/${item._id}`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
