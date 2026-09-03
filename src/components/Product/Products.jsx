import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import "./Products.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync state with URL params so direct links work (e.g., /products?category=Harmonium)
  const categoryParam = searchParams.get("category") || "All";
  const searchParam = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState(searchParam);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Acoustic & Classical Instruments | Krishna Musicals";

    let isMounted = true;

    axios
      .get(`${API_BASE_URL}/api/products`)
      .then((response) => {
        if (!isMounted) return;
        const rawProducts = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // Guard: customer catalog should only display active instruments
        const activeOnly = rawProducts.filter(
          (item) => item.status !== "inactive",
        );

        setProducts(activeOnly);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching catalog products:", err);
        setError("Failed to load instruments. Please check your connection.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update query params when filters change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    const newParams = new URLSearchParams(searchParams);
    if (!value.trim()) {
      newParams.delete("search");
    } else {
      newParams.set("search", value.trim());
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setSearchParams(new URLSearchParams());
  };

  // Derive unique categories dynamically
  const categories = useMemo(() => {
    const unique = new Set(
      products.map((item) => item.category?.trim()).filter(Boolean),
    );
    return ["All", ...Array.from(unique)];
  }, [products]);

  // Filter products by category, name, and brand safely
  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category?.trim().toLowerCase() ===
          selectedCategory.toLowerCase();

      const nameMatch = (product.name || "")
        .toLowerCase()
        .includes(cleanSearch);
      const brandMatch = (product.brand || "")
        .toLowerCase()
        .includes(cleanSearch);
      const descMatch = (product.description || "")
        .toLowerCase()
        .includes(cleanSearch);

      const matchesSearch =
        !cleanSearch || nameMatch || brandMatch || descMatch;

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <main className="products-page">
      {/* Header */}
      <section className="products-header">
        <p className="section-label">OUR COLLECTION</p>
        <h1>Handcrafted & Branded Instruments</h1>
        <p>
          Explore concert harmoniums, sitars, tablas, and acoustic gear tested
          and tuned by four generations of master craftsmen.
        </p>
      </section>

      {/* Filter Controls Bar */}
      <section className="products-controls">
        <div className="products-search">
          <input
            type="text"
            placeholder="Search by instrument name, brand, or model..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="category-filters" role="tablist">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-pill ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Results Metadata */}
      {!loading && !error && (
        <div className="catalog-meta-bar">
          <p className="results-count">
            Showing <strong>{filteredProducts.length}</strong> of{" "}
            {products.length} instruments
            {selectedCategory !== "All" && ` in "${selectedCategory}"`}
          </p>

          {(selectedCategory !== "All" || searchTerm) && (
            <button
              type="button"
              className="clear-all-filters-btn"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Catalog Grid */}
      <section className="products-grid-section">
        {loading ? (
          <div className="products-message-card">
            <p>Loading catalog collection...</p>
          </div>
        ) : error ? (
          <div className="products-message-card error">
            <p>{error}</p>
            <button
              type="button"
              className="retry-fetch-btn"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-message-card empty">
            <h3>No Instruments Found</h3>
            <p>
              We couldn't find any instruments matching your criteria. Try
              broadening your search terms or view another category.
            </p>
            <button
              type="button"
              className="reset-catalog-btn"
              onClick={handleResetFilters}
            >
              View All Instruments
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Products;
