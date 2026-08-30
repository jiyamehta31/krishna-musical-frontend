import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./EditProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    stock: "",
    status: "active",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://krishna-musical-backend.onrender.com/api/products/${id}`)
      .then((response) => {
        const product = response.data.data;

        setFormData({
          name: product.name || "",
          category: product.category || "",
          brand: product.brand || "",
          description: product.description || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          status: product.status || "active",
        });

        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching product:", error);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `https://krishna-musical-backend.onrender.com/api/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Product updated:", response.data);

      alert("Product updated successfully!");

      navigate("/admin/products");
    } catch (error) {
      console.log("Error updating product:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update product",
      );
    }
  };

  if (loading) {
    return (
      <main className="edit-product-page">
        <div className="edit-product-container">
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-product-page">
      <div className="edit-product-container">
        <h1>Edit Product</h1>

        <form className="edit-product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Product name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              placeholder="Brand"
              value={formData.brand}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  brand: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value,
                })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button type="submit" className="edit-product-button">
            Update Product
          </button>
        </form>
      </div>
    </main>
  );
};

export default EditProduct;

