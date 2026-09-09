import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import AuthProvider from "./context/AuthContext.jsx";

import Home from "./components/Home/Home";
import Products from "./components/Product/Products";
import ProductDetails from "./components/Product/ProductDetails";
import AboutUs from "./components/About/AboutUs";
import Contact from "./components/Contact/Contact";
import Offers from "./components/Offers/Offers";
import Profile from "./components/Profile/Profile";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsappButton from "./components/WhatsappButton";

import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminProducts from "./components/Admin/AdminProducts";
import AdminLogin from "./components/Admin/AdminLogin";
import ProtectedRoute from "./components/Admin/ProtectedRoute";
import AddProduct from "./components/Admin/AddProduct";
import EditProduct from "./components/Admin/EditProduct";
import FloatingProducts from "./components/Product/FloatingProducts.jsx";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PublicLayout = () => {
  return (
    <div className="app">
      <Navbar />
      <div className="main-content">
        <Outlet />
      </div>
      <FloatingProducts />
      <WhatsappButton />
      <Footer />
    </div>
  );
};

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
        background: "var(--cream-bg, #f8f3e8)",
      }}
    >
      <h1
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "48px",
          color: "var(--navy-primary, #0c1f34)",
          margin: "0 0 12px",
          fontWeight: 500,
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "22px",
          color: "var(--navy-primary, #0c1f34)",
          margin: "0 0 16px",
          fontFamily: "Georgia, serif",
          fontWeight: 500,
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: "var(--text-muted, #6e695f)",
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
          background: "var(--navy-primary, #0c1f34)",
          color: "var(--cream-bg, #f8f3e8)",
          borderRadius: "6px",
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
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

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
    </AuthProvider>
  );
};

export default App;
