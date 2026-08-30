import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminProducts.css";
import { useNavigate } from "react-router-dom";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://krishna-musical-backend.onrender.com/api/products")
      .then((response) => {
        setProducts(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    return (
      product.name?.toLowerCase().includes(search) ||
      product.brand?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    );
  });
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`https://krishna-musical-backend.onrender.com/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== id),
      );
    } catch (error) {
      console.log("Error deleting product:", error);
    }
  };

  return (
    <main className="admin-products">
      <section className="admin-products-header">
        <div>
          <p className="section-label">ADMIN PANEL</p>

          <h1>Manage Products</h1>

          <p>
            Add, edit, and manage the musical instruments displayed on your
            website.
          </p>
        </div>

        <button
          className="admin-primary-button"
          onClick={() => navigate("/admin/products/add")}
        >
          + Add Product
        </button>
      </section>

      <section className="admin-products-content">
        <div className="admin-products-toolbar">
          <h2>All Products</h2>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-products-list">
          {loading ? (
            <p className="admin-products-message">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="admin-products-message">No products found.</p>
          ) : (
            filteredProducts.map((product) => (
              <div className="admin-product-row" key={product._id}>
                <div className="admin-product-image">
                  {product.images?.length > 0 && (
                    <img
                      src={`https://krishna-musical-backend.onrender.com/${product.images[0].url}`}
                      alt={product.images[0].alt || product.name}
                    />
                  )}
                </div>

                <div className="admin-product-details">
                  <p>{product.category}</p>

                  <h3>{product.name}</h3>

                  <span>{product.brand || "No brand specified"}</span>
                </div>

                <div className="admin-product-actions">
                  <button
                    className="admin-edit-button"
                    onClick={() =>
                      navigate(`/admin/products/edit/${product._id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="admin-delete-button"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminProducts;
