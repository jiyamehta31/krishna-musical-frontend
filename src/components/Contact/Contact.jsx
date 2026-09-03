import { useState } from "react";
import axios from "axios";
import "./Contact.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const WHATSAPP_NUMBER = "918829906454";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState({
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusFeedback({ type: "", message: "" });

    // 1. Validation
    const cleanedPhone = formData.phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      setStatusFeedback({
        type: "error",
        message: "Please enter a valid 10-digit contact number.",
      });
      return;
    }

    setSubmitting(true);

    // 2. Format WhatsApp text
    const formattedWhatsAppMessage = `*New Website Enquiry - Krishna Musicals*
*Name:* ${formData.name.trim()}
*Phone:* ${formData.phone.trim()}
*Email:* ${formData.email.trim() || "Not provided"}

*Enquiry:*
${formData.message.trim()}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      formattedWhatsAppMessage,
    )}`;

    // 3. Open WhatsApp IMMEDIATELY (synchronously within user click context)
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // 4. Fire-and-forget backend logging in the background (non-blocking)
    axios
      .post(`${API_BASE_URL}/api/enquiries`, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      })
      .catch((err) => {
        console.warn("Could not record enquiry in database:", err);
      });

    // 5. Clean up UI immediately
    setStatusFeedback({
      type: "success",
      message: "Opening WhatsApp... Your message is ready to send!",
    });

    setFormData({
      name: "",
      phone: "",
      email: "",
      message: "",
    });

    setSubmitting(false);
  };

  return (
    <main className="contact-page">
      {/* Header */}
      <section className="contact-header">
        <p className="section-label">GET IN TOUCH</p>
        <h1>Contact Us</h1>
        <p>
          Have a question about an instrument, custom tuning, or wholesale
          inquiries? We are here to help.
        </p>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        {/* Information Panel */}
        <div className="contact-info">
          <p className="section-label">LET'S CONNECT</p>
          <h2>We're Here to Help</h2>

          <p className="contact-intro">
            Whether you are looking for a concert-grade harmonium, brass sitar,
            or student instruments, reach out to our craftsmen directly.
          </p>

          <div className="contact-details">
            <div className="contact-detail">
              <h3>Phone & WhatsApp</h3>
              <p>
                <a href="tel:+918829906454">+91 88299 06454</a>
              </p>
            </div>

            <div className="contact-detail">
              <h3>Email</h3>
              <p>
                <a href="mailto:info@krishnamusicals.com">
                  info@krishnamusicals.com
                </a>
              </p>
            </div>

            <div className="contact-detail">
              <h3>Workshop & Showroom</h3>
              <p>Krishna Musicals, Main Market, Rajasthan, India</p>
            </div>

            <div className="contact-detail">
              <h3>Store Hours</h3>
              <p>Monday – Saturday: 10:00 AM – 8:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="contact-form-wrapper">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Send Us a Message</h2>

            {statusFeedback.message && (
              <div
                className={`contact-alert ${
                  statusFeedback.type === "error"
                    ? "alert-error"
                    : "alert-success"
                }`}
                role="alert"
              >
                {statusFeedback.message}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="contact-name">Name *</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                disabled={submitting}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-phone">Phone Number *</label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com (optional)"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Message *</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what instrument or service you are inquiring about..."
                rows="5"
                disabled={submitting}
                required
              />
            </div>

            <button
              type="submit"
              className="contact-submit"
              disabled={submitting}
            >
              {submitting ? "Opening WhatsApp..." : "Send Message on WhatsApp"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Contact;
