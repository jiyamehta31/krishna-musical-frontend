import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import { transformInstagramPostToProduct } from "../../utils/instagramAdapter";
import "./Products.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com/api";

const INSTAGRAM_FEED_URL =
  import.meta.env.VITE_INSTAGRAM_FEED_URL ||
  "https://feeds.behold.so/xzK6rxt0HtOb3FvyCdHg";

const DEFAULT_CATEGORIES = [
  "All",
  "Guitars",
  "Keyboards & Pianos",
  "Drums & Percussion",
  "Wind & Brass",
  "Indian Classical",
  "School Items",
  "Other Instruments",
  "Accessories",
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedCategory = searchParams.get("category") || "All";
  const urlSearch = searchParams.get("search") || "";

  // 1. Local state + tracker for external URL changes
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  // Adjust state during render if URL changed externally (Back / Forward navigation)
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchInput(urlSearch);
  }
  // 2. Debounce updating the URL and use replace: true to avoid stack-filling
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuery = searchParams.get("search") || "";
      const trimmed = searchInput.trim();

      if (trimmed !== currentQuery) {
        const newParams = new URLSearchParams(searchParams);
        if (trimmed) {
          newParams.set("search", trimmed);
        } else {
          newParams.delete("search");
        }
        // replace: true prevents pushing each character to the browser history
        setSearchParams(newParams, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Acoustic & Classical Instruments | Krishna Musicals";

    let isMounted = true;

    const fetchCatalog = axios.get(`${API_BASE_URL}/products`).then((res) => {
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.products)
            ? raw.products
            : [];
      return list.filter((item) => item.status !== "inactive");
    });

    const fetchInstagram = INSTAGRAM_FEED_URL
      ? fetch(INSTAGRAM_FEED_URL)
          .then((res) => {
            if (!res.ok) throw new Error(`Behold HTTP error: ${res.status}`);
            return res.json();
          })
          .then((data) => {
            const rawPosts = Array.isArray(data)
              ? data
              : Array.isArray(data?.posts)
                ? data.posts
                : [];
            return rawPosts;
          })
          .catch((err) => {
            console.warn("Instagram feed unavailable:", err.message);
            return [];
          })
      : Promise.resolve([]);

    Promise.allSettled([fetchCatalog, fetchInstagram])
      .then(([dbResult, igResult]) => {
        if (!isMounted) return;

        const dbProducts =
          dbResult.status === "fulfilled" && Array.isArray(dbResult.value)
            ? dbResult.value
            : [];

        const syncedIds = new Set();
        const syncedPermalinks = new Set();

        dbProducts.forEach((p) => {
          if (p.instagramId) {
            syncedIds.add(String(p.instagramId).trim());
          }
          if (p.instagramUrl) {
            syncedPermalinks.add(
              String(p.instagramUrl).trim().replace(/\/+$/, ""),
            );
          }
        });

        let unSyncedIgProducts = [];

        if (igResult.status === "fulfilled" && Array.isArray(igResult.value)) {
          unSyncedIgProducts = igResult.value
            .filter((post) => {
              const cleanPostId = String(post.id).trim();
              const cleanPermalink = String(post.permalink || "")
                .trim()
                .replace(/\/+$/, "");

              const isDuplicate =
                syncedIds.has(cleanPostId) ||
                (cleanPermalink && syncedPermalinks.has(cleanPermalink));

              return !isDuplicate;
            })
            .map((post) => transformInstagramPostToProduct(post));
        }

        const combined = [...dbProducts, ...unSyncedIgProducts];

        setProducts(combined);
        setError("");
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load catalog:", err);
        setError("Unable to load instrument inventory. Please refresh.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
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
    // Clicking a distinct category is an intentional action, so we allow regular push navigation
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearchParams(newParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const categories = useMemo(() => {
    const fromProducts = products
      .map((item) => item.category?.trim())
      .filter(Boolean);

    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromProducts]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const cleanSearch = searchInput.trim().toLowerCase();

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
  }, [products, selectedCategory, searchInput]);

  return (
    <main className="products-page">
      <section className="products-header">
        <p className="section-label">OUR COLLECTION</p>
        <h1>Handcrafted &amp; Branded Instruments</h1>
        <p>
          Explore concert harmoniums, sitars, marching band gear, keyboards, and
          acoustic instruments tested and tuned for performers and institutions.
        </p>
      </section>

      <section className="products-controls">
        <div className="products-search">
          <input
            type="text"
            placeholder="Search by instrument, brand, or category..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
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

      {!loading && !error && (
        <div className="catalog-meta-bar">
          <p className="results-count">
            Showing <strong>{filteredProducts.length}</strong> of{" "}
            {products.length} instruments
            {selectedCategory !== "All" && ` in "${selectedCategory}"`}
          </p>

          {(selectedCategory !== "All" || searchInput) && (
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
};;

export default Products;
