import "./WhatsappButton.css"
;

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919414592216";

const DEFAULT_MESSAGE =
  "Hello Krishna Musicals, I am browsing your website and would like to enquire about your instruments.";

const WhatsAppButton = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    DEFAULT_MESSAGE,
  )}`;

  return (
    <aside
      className="floating-whatsapp-wrapper"
      aria-label="WhatsApp live chat"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Chat with Krishna Musicals on WhatsApp"
      >
        <svg
          className="whatsapp-icon"
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.101-.477-.15-.678.15-.201.301-.778.978-.954 1.18-.176.2-.351.226-.653.076-.301-.15-1.272-.469-2.424-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.2.05-.376-.025-.526-.075-.15-.678-1.632-.929-2.235-.245-.588-.493-.509-.678-.518-.176-.009-.376-.01-.577-.01-.201 0-.527.075-.803.376s-1.054 1.029-1.054 2.509 1.079 2.91 1.23 3.111c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.634.721.23 1.377.197 1.896.12.578-.086 1.78-.727 2.03-1.43.251-.703.251-1.304.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2C6.544 2 2.08 6.464 2.08 11.96c0 1.954.564 3.784 1.542 5.335L2 22l4.851-1.579c1.5 1.018 3.327 1.614 5.189 1.614 5.496 0 9.96-4.464 9.96-9.96S17.536 2 12.04 2zm0 18.23c-1.65 0-3.178-.516-4.444-1.399l-.319-.224-2.88.938.948-2.809-.232-.328A8.17 8.17 0 013.88 11.96c0-4.5 3.66-8.16 8.16-8.16 4.5 0 8.16 3.66 8.16 8.16 0 4.5-3.66 8.27-8.16 8.27z" />
        </svg>

        <span className="whatsapp-tooltip">Chat with us</span>
      </a>
    </aside>
  );
};

export default WhatsAppButton;
