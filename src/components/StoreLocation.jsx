import "./StoreLocation.css"
;

const StoreLocation = () => {
  const storeDetails = {
    name: "Krishna Musicals",
    address: "16, Meera Marg, Gandhi Murti, Suraj Pole, Pali, Rajasthan 306401",
    phone: "09414592216",
    displayPhone: "+91 94145 92216",
    timings: "Mon - Sat: 10:00 AM - 8:30 PM (Sunday Open)",

    // Precise embed query for 16, Meera Marg, Gandhi Murti, Suraj Pole, Pali
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3592.6984717939713!2d73.33012529999999!3d25.780521299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3942730413ffff8d%3A0x165cb3c38c1ad275!2sKrishna%20Harmoiniam%20%26%20Musical%20Center!5e0!3m2!1sen!2sin!4v1788797001859!5m2!1sen!2sin",

    // Direct link to open Google Maps app navigation
    directionsUrl: "https://maps.app.goo.gl/16DWz34qqPDC9PZf8?g_st=aw",
  };

  return (
    <section className="store-location-section">
      <div className="location-container">
        <div className="location-info-card">
          <span className="location-badge">Visit Our Showroom</span>
          <h2>Experience the Instruments in Person</h2>
          <p className="location-desc">
            Explore our handcrafted guitars, digital keyboards, harmoniums,
            violins, and sound equipment. Stop by our showroom to test any
            instrument before you purchase.
          </p>

          <div className="info-item">
            <strong>Address</strong>
            <p>{storeDetails.address}</p>
          </div>

          <div className="info-item">
            <strong>Store Hours</strong>
            <p>{storeDetails.timings}</p>
          </div>

          <div className="info-item">
            <strong>Phone</strong>
            <p>
              <a
                href={`tel:${storeDetails.phone}`}
                style={{
                  color: "var(--navy-primary, #0c1f34)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {storeDetails.displayPhone}
              </a>
            </p>
          </div>

          <a
            href={storeDetails.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="directions-btn"
          >
            Get Directions on Google Maps ↗
          </a>
        </div>

        <div className="map-frame-wrapper">
          <iframe
            title="Krishna Musicals Showroom - Suraj Pole, Pali"
            src={storeDetails.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

export default StoreLocation;
