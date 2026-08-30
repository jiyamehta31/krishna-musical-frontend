import "./WhatsappButton.css"
const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/9724603180"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      aria-label="Contact us on WhatsApp"
    >
      <span>☏</span>
    </a>
  );
};

export default WhatsAppButton;
