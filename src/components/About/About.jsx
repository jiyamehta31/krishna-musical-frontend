import "./About.css";

const About = () => {
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
          <div className="about-value-card">
            <h3>Generations of Experience</h3>
            <p>
              Decades of experience passed from one generation to the next,
              preserving knowledge and craftsmanship.
            </p>
          </div>

          <div className="about-value-card">
            <h3>Quality Instruments</h3>
            <p>
              We carefully select instruments with musicians and their musical
              needs in mind.
            </p>
          </div>

          <div className="about-value-card">
            <h3>Traditional Craftsmanship</h3>
            <p>
              We value the traditional skills and craftsmanship that give
              musical instruments their character.
            </p>
          </div>

          <div className="about-value-card">
            <h3>Musical Passion</h3>
            <p>
              Music remains at the heart of our journey and everything we strive
              to offer.
            </p>
          </div>
        </div>
      </section>

      {/* Dealership */}
      <section className="about-dealership">
        <div className="about-dealership-content">
          <p className="section-label">OUR REACH</p>

          <h2>Serving Musicians Across Generations</h2>

          <p>
            With multiple branches and an established presence in the musical
            instrument industry, we continue to serve musicians while preserving
            the values that have shaped our journey.
          </p>
        </div>
      </section>
    </main>
  );
};

export default About;
