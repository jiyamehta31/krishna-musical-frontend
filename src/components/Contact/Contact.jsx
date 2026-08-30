import { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = (e) => {
   e.preventDefault();

   const clientNumber = "8829906454";

   const whatsappMessage = `
Hello, I would like to make an enquiry.

Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email || "Not provided"}

Message:
${formData.message}
  `;

   const whatsappUrl = `https://wa.me/${clientNumber}?text=${encodeURIComponent(
     whatsappMessage,
   )}`;

   window.open(whatsappUrl, "_blank");

   setFormData({
     name: "",
     phone: "",
     email: "",
     message: "",
   });
 };
  return (
    <main className="contact-page">
      {/* Header */}
      <section className="contact-header">
        <p className="section-label">GET IN TOUCH</p>

        <h1>Contact Us</h1>

        <p>
          Have a question about an instrument? We'd be happy to hear from you.
        </p>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        {/* Information */}
        <div className="contact-info">
          <p className="section-label">LET'S CONNECT</p>

          <h2>We're Here to Help</h2>

          <p className="contact-intro">
            Whether you're looking for a particular instrument or simply want to
            know more about our collection, feel free to reach out.
          </p>

          <div className="contact-details">
            <div className="contact-detail">
              <h3>Phone</h3>
              <p>Contact details will be added here.</p>
            </div>

            <div className="contact-detail">
              <h3>Email</h3>
              <p>Contact details will be added here.</p>
            </div>

            <div className="contact-detail">
              <h3>Our Locations</h3>
              <p>Multiple branches across the region.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-wrapper">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Send Us a Message</h2>

            <div className="form-group">
              <label htmlFor="name">Name</label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                rows="6"
                required
              />
            </div>

            <button type="submit" className="contact-submit">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Contact;
