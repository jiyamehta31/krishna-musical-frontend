import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

// Client Pages
import Home from "./components/Home/Home";
import Products from "./components/Product/Products";
import ProductDetails from "./components/Product/ProductDetails";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Offers from "./components/Offers/Offers";
import Profile from "./components/Profile/Profile";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";

// Client Persistent Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsappButton from "./components/WhatsappButton";

// Admin Pages & Protection
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminProducts from "./components/Admin/AdminProducts";
import AdminLogin from "./components/Admin/AdminLogin";
import ProtectedRoute from "./components/Admin/ProtectedRoute";
import AddProduct from "./components/Admin/AddProduct";
import EditProduct from "./components/Admin/EditProduct";

// 1. Global Scroll Restoration Helper
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

// 2. Client-Facing Layout (Navbar + Content + WhatsApp + Footer)
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <WhatsappButton />
      <Footer />
    </>
  );
};

// 3. 404 Not Found Page Component
const NotFound = () => {
  return (
    <main
      style={{
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
        background: "var(--cream, #f7f3eb)",
      }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "48px",
          color: "var(--navy, #0f172a)",
          margin: "0 0 12px",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "22px",
          color: "var(--navy, #0f172a)",
          margin: "0 0 16px",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: "var(--text-muted, #64748b)",
          maxWidth: "420px",
          lineHeight: "1.6",
          margin: "0 0 24px",
        }}
      >
        The musical instrument or page you are looking for has been moved or
        does not exist.
      </p>
      <a
        href="/"
        style={{
          padding: "12px 24px",
          background: "var(--navy, #0f172a)",
          color: "var(--cream, #f7f3eb)",
          borderRadius: "4px",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        Return to Home
      </a>
    </main>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* =========================================
            PUBLIC CLIENT STORE ROUTES
        ========================================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* =========================================
            ADMIN AUTH (STANDALONE CLEAN VIEW)
        ========================================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* =========================================
            PROTECTED ADMIN DASHBOARD ROUTES
        ========================================= */}
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
