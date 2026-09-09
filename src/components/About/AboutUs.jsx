import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./AboutUs.css"
;

const STATS = [
  { value: "60+", label: "Years of Experience" },
  { value: "4th", label: "Generation" },
  { value: "7", label: "Branches" },
  { value: "3", label: "Branches in Pali" },
];

const SERVICES = [
  {
    step: "01",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    title: "Musical Instruments",
    desc: "Explore a wide range of musical instruments for different musical needs and performance styles.",
  },
  {
    step: "02",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Handmade Craftsmanship",
    desc: "Experience instruments connected with traditional craftsmanship and authentic musical heritage.",
  },
  {
    step: "03",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "Authorized Dealership",
    desc: "We provide instruments through verified dealerships, helping musicians select with total confidence.",
  },
  {
    step: "04",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Repairing & Service",
    desc: "Our precision repair service helps musicians keep their instruments calibrated and concert-ready.",
  },
  {
    step: "05",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Secure Branded Delivery",
    desc: "Carefully packaged, door-to-door delivery so your instruments arrive safely without damage.",
  },
];

const WHY_US = [
  {
    num: "01",
    title: "Decades of Experience",
    desc: "More than six decades of continuous presence and expertise in the musical instrument industry.",
  },
  {
    num: "02",
    title: "Generational Knowledge",
    desc: "Four generations dedicated to preserving traditional acoustic tuning and instrument craftsmanship.",
  },
  {
    num: "03",
    title: "Multiple Locations",
    desc: "A wide presence across seven operational branches, including three dedicated showrooms in Pali.",
  },
  {
    num: "04",
    title: "End-to-End Support",
    desc: "From initial instrument selection to periodic tuning, servicing, and doorstep delivery.",
  },
];

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About Us | Krishna Musicals";
  }, []);

  return (
    <main className="about-page">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero-overlay">
          <p className="about-eyebrow">KRISHNA MUSICALS</p>
          <h1>About Us</h1>
          <p>A Legacy of Music, Craftsmanship & Trust</p>
          <span>Since 1960</span>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="about-intro">
        <div className="about-intro-content">
          <div className="about-section-label">
            <span aria-hidden="true" />
            OUR STORY
            <span aria-hidden="true" />
          </div>

          <h2>
            A Legacy Built Around <em>Music</em>
          </h2>

          <p>
            Krishna Musicals carries a legacy of more than six decades in the
            world of musical instruments. Established in 1960, the business has
            continued its journey across generations with a deep connection to
            music and acoustic craftsmanship.
          </p>

          <p>
            Today, the fourth generation is actively involved in the business,
            carrying forward the experience and values built over the years.
            With multiple branches and a wide range of musical instruments,
            Krishna Musicals continues to serve musicians and learners with
            dedication.
          </p>
        </div>

        <div className="about-year-card">
          <span>EST.</span>
          <strong>1960</strong>
          <p>Years of Musical Legacy</p>
        </div>
      </section>

      {/* STATS */}
      <section className="about-stats" aria-label="Company Statistics">
        {STATS.map((stat, idx) => (
          <div className="about-stat" key={idx}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* CRAFTSMANSHIP */}
      <section className="about-craftsmanship">
        <div className="about-craft-image">
          <div className="craft-image-content">
            <span>THE ART OF</span>
            <h2>Craftsmanship</h2>
          </div>
        </div>

        <div className="about-craft-content">
          <div className="about-section-label left">
            <span aria-hidden="true" />
            OUR CRAFT
          </div>

          <h2>
            Where Experience Meets <em>Craftsmanship</em>
          </h2>

          <p>
            Musical instruments are more than objects — they are an extension of
            the music created by every artist. At Krishna Musicals, years of
            experience and fine craftsmanship combine to deliver instruments
            that musicians can genuinely connect with.
          </p>

          <p>
            Our journey has evolved through generations, allowing traditional
            knowledge, wood curation, and tuning standards to remain integral to
            our brand.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="about-services">
        <div className="about-section-heading">
          <div className="about-section-label">
            <span aria-hidden="true" />
            WHAT WE OFFER
            <span aria-hidden="true" />
          </div>

          <h2>
            More Than Just <em>Instruments</em>
          </h2>

          <p>
            Comprehensive services designed to support every phase of your
            musical journey.
          </p>
        </div>

        <div className="about-service-grid">
          {SERVICES.map((service) => (
            <article className="about-service-card" key={service.step}>
              <div className="service-number">{service.step}</div>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* GENERATIONS TIMELINE */}
      <section className="about-generations">
        <div className="generations-content">
          <div className="about-section-label left light">
            <span aria-hidden="true" />
            FOUR GENERATIONS
          </div>

          <h2>A Journey That Continues</h2>

          <p>
            From 1960 to today, Krishna Musicals has continued to expand while
            remaining deeply rooted in artisanal values. With the fourth
            generation now at the helm, our heritage enters a modern era.
          </p>

          <div className="generation-line">
            <div className="generation-item">
              <span>1960</span>
              <p>The Journey Begins</p>
            </div>
            <div className="generation-line-bar" aria-hidden="true" />
            <div className="generation-item">
              <span>Today</span>
              <p>Fourth Generation</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="about-why">
        <div className="about-section-heading">
          <div className="about-section-label">
            <span aria-hidden="true" />
            WHY KRISHNA MUSICALS
            <span aria-hidden="true" />
          </div>

          <h2>
            Built on Experience & <em>Trust</em>
          </h2>
        </div>

        <div className="why-grid">
          {WHY_US.map((item) => (
            <div className="why-item" key={item.num}>
              <strong>{item.num}</strong>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-content">
          <p>LET THE MUSIC BEGIN</p>
          <h2>
            Find the Instrument
            <br />
            That's Right for You
          </h2>

          <div className="about-cta-buttons">
            <Link to="/products" className="about-primary-btn">
              Explore Instruments
            </Link>
            <Link to="/contact" className="about-secondary-btn">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
