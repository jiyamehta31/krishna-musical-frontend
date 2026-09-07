import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import { transformInstagramPostToProduct } from "../../utils/instagramAdapter";
import "./Products.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

// Behold.so JSON endpoint
const INSTAGRAM_FEED_URL =
  import.meta.env.VITE_INSTAGRAM_FEED_URL ||
  "https://feeds.behold.so/xzK6rxt0HtOb3FvyCdHg";

// Default catalog categories aligned with your Product model
const DEFAULT_CATEGORIES = [
  "All",
  "Guitars",
  "Keyboards & Pianos",
  "Drums & Percussion",
  "Wind & Brass",
  "Indian Classical",
  "School Items",
  "Other Instruments", // Auto-feed live Instagram items land here
  "Accessories",
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Derive directly from URL params - Single Source of Truth
  const selectedCategory = searchParams.get("category") || "All";
  const searchTerm = searchParams.get("search") || "";

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Acoustic & Classical Instruments | Krishna Musicals";

    let isMounted = true;

    // 1. Fetch backend database products via Axios
    const catalogPromise = axios
      .get(`${API_BASE_URL}/api/products`)
      .then((res) => {
        const rawProducts = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.products)
            ? res.data.products
            : [];
        return rawProducts.filter((item) => item.status !== "inactive");
      });

    // 2. Fetch Behold feed via native fetch() to bypass Axios defaults/interceptors
    const instagramPromise = INSTAGRAM_FEED_URL
      ? fetch(INSTAGRAM_FEED_URL)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Behold HTTP error: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            const rawPosts = Array.isArray(data)
              ? data
              : Array.isArray(data?.posts)
                ? data.posts
                : [];
            return rawPosts.map(transformInstagramPostToProduct);
          })
          .catch((err) => {
            console.warn(
              "Instagram feed temporarily unavailable:",
              err.message,
            );
            return [];
          })
      : Promise.resolve([]);

    // Parallel fetch with resilient error boundaries
    Promise.allSettled([catalogPromise, instagramPromise])
      .then(([catalogResult, igResult]) => {
        if (!isMounted) return;

        let dbItems = [];
        let igItems = [];

        if (catalogResult.status === "fulfilled") {
          dbItems = catalogResult.value;
        } else {
          console.error("Catalog fetch failed:", catalogResult.reason);
          setError("Failed to load instruments. Please check your connection.");
        }

        if (igResult.status === "fulfilled") {
          igItems = igResult.value;
        }

        // Merge both streams
        setProducts([...dbItems, ...igItems]);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Unexpected catalog error:", err);
        setError("Unable to display collection at this time.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value.trim()) {
      newParams.delete("search");
    } else {
      newParams.set("search", value.trim());
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Merge default categories with any dynamic categories present in products
  const categories = useMemo(() => {
    const fromProducts = products
      .map((item) => item.category?.trim())
      .filter(Boolean);

    const combined = Array.from(
      new Set([...DEFAULT_CATEGORIES, ...fromProducts]),
    );
    return combined;
  }, [products]);

  // Filter products by category, name, brand, description, and subcategory
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
      const subCatMatch = (product.subCategory || "")
        .toLowerCase()
        .includes(cleanSearch);

      const matchesSearch =
        !cleanSearch || nameMatch || brandMatch || descMatch || subCatMatch;

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <main className="products-page">
      {/* Header */}
      <section className="products-header">
        <p className="section-label">OUR COLLECTION</p>
        <h1>Handcrafted &amp; Branded Instruments</h1>
        <p>
          Explore concert harmoniums, sitars, marching band gear, keyboards, and
          acoustic instruments tested and tuned for performers and institutions.
        </p>
      </section>

      {/* Filter Controls Bar */}
      <section className="products-controls">
        <div className="products-search">
          <input
            type="text"
            placeholder="Search by instrument, brand, or category..."
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
                selectedCategory.toLowerCase() === category.toLowerCase()
                  ? "active"
                  : ""
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
              {category === "Other Instruments" && (
                <span
                  style={{
                    fontSize: "11px",
                    marginLeft: "5px",
                    verticalAlign: "middle",
                  }}
                  title="Live Instagram Showcase"
                >
                  📸
                </span>
              )}
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
        ) : error && products.length === 0 ? (
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
              We couldn&apos;t find any instruments in &quot;{selectedCategory}
              &quot; matching your criteria.
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
