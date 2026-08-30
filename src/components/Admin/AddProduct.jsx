import { useState } from "react";
import axios from "axios";
import "./AddProduct.css";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    stock: "",
    status: "active",
  });

  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("brand", formData.brand);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("status", formData.status);

    images.forEach((image) => {
      data.append("images", image);
    });

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://krishna-musical-backend.onrender.com/api/products",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Product created:", response.data);
      alert("Product added successfully!");

      setFormData({
        name: "",
        category: "",
        brand: "",
        description: "",
        price: "",
        stock: "",
        status: "active",
      });

      setImages([]);
    } catch (error) {
      console.log("Error adding product:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add product",
      );
    }
  };

  return (
    <main className="add-product-page">
      <div className="add-product-container">
        <h1>Add Product</h1>

        <form className="add-product-form" onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Product Images</label>

            <p className="image-upload-info">
              Select up to 5 images at once (JPG, PNG, WebP)
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
            />

            {images.length > 0 && (
              <div className="selected-images">
                <p>{images.length} image(s) selected</p>

                {images.map((image, index) => (
                  <p key={index}>✓ {image.name}</p>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="add-product-button">
            Add Product
          </button>
        </form>
      </div>
    </main>
  );
};

export default AddProduct;
