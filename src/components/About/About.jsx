import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./About.css";

const CORE_VALUES = [
  {
    title: "Generations of Experience",
    description:
      "Decades of experience passed from one generation to the next, preserving knowledge and craftsmanship.",
  },
  {
    title: "Quality Instruments",
    description:
      "We carefully select instruments with musicians and their musical needs in mind.",
  },
  {
    title: "Traditional Craftsmanship",
    description:
      "We value the traditional skills and craftsmanship that give musical instruments their character.",
  },
  {
    title: "Musical Passion",
    description:
      "Music remains at the heart of our journey and everything we strive to offer.",
  },
];

const About = () => {
  // Fix scroll position and update page title on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About Us | Heritage Musical Instruments";
  }, []);

  return (
    <main className="about-page">
      {/* Header */}
      <section className="about-page-header">
        <p className="section-label">OUR STORY</p>
        <h1>About Us</h1>
        <p>
          A journey built around music, craftsmanship, and generations of
          experience.
        </p>
      </section>

      {/* Legacy */}
      <section className="about-legacy">
        <div className="about-legacy-content">
          <p className="section-label">OUR LEGACY</p>
          <h2>A Legacy of Music Since 1960</h2>
          <p>
            What began in 1960 has grown into a musical journey carried forward
            through generations. Our passion for music and commitment to quality
            continue to guide everything we do.
          </p>
          <p>
            Today, the tradition continues through the fourth generation,
            bringing together experience, craftsmanship, and a deep
            understanding of musical instruments.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="about-section-heading">
          <p className="section-label">WHAT WE VALUE</p>
          <h2>Built on Experience and Trust</h2>
          <p>
            Our journey has always been guided by the values that matter most to
            musicians.
          </p>
        </div>

        <div className="about-values-grid">
          {CORE_VALUES.map((value, index) => (
            <div key={index} className="about-value-card">
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dealership & CTA */}
      <section className="about-dealership">
        <div className="about-dealership-content">
          <p className="section-label">OUR REACH</p>
          <h2>Serving Musicians Across Generations</h2>
          <p>
            With multiple branches and an established presence in the musical
            instrument industry, we continue to serve musicians while preserving
            the values that have shaped our journey.
          </p>

          <div className="about-actions" style={{ marginTop: "2rem" }}>
            <Link to="/products" className="btn btn-primary">
              Explore Our Collection
            </Link>
            <Link
              to="/contact"
              className="btn btn-secondary"
              style={{ marginLeft: "1rem" }}
            >
              Visit Our Branches
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
