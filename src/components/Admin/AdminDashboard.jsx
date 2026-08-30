import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {

  const navigate = useNavigate();
  
  return (
    <main className="admin-dashboard">
      <section className="admin-header">
        <div>
          <p className="section-label">ADMIN PANEL</p>
          <h1>Dashboard</h1>
          <p>
            Manage your instruments, offers, and customer enquiries from one
            place.
          </p>
        </div>
      </section>

      <section className="admin-stats">
        <div className="admin-stat-card">
          <span>Products</span>
          <h2>—</h2>
          <p>Total instruments</p>
        </div>

        <div className="admin-stat-card">
          <span>Offers</span>
          <h2>—</h2>
          <p>Active offers</p>
        </div>

        <div className="admin-stat-card">
          <span>Enquiries</span>
          <h2>—</h2>
          <p>Customer enquiries</p>
        </div>

        <div className="admin-stat-card">
          <span>Categories</span>
          <h2>—</h2>
          <p>Instrument categories</p>
        </div>
      </section>

      <section className="admin-actions">
        <h2>Quick Actions</h2>

        <div className="admin-actions-grid">
          <button onClick={() => navigate("/admin/products/add")}>
            Add Product
          </button>
          <button onClick={() => navigate("/admin/products")}>
            Manage Products
          </button>
          <button>Manage Offers</button>
          <button>View Enquiries</button>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
