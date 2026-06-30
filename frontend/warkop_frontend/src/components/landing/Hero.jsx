export default function Hero({
  heroSlides,
  currentSlide,
  setCurrentSlide,
}) {
  return (
    <section id="hero" className="hero-section">
      <div id="slide-container">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`hero-slide ${
              i === currentSlide ? "active" : ""
            }`}
          >
            <img
              src={slide.img}
              alt={`Slide ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
            />

            <div className="overlay"></div>
          </div>
        ))}
      </div>

      <div className="hero-content-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">

              <div className="hero-eyebrow reveal">
                <i className="bi bi-stars"></i>
                {" "}
                Tukang Ngopi, Cari Duit Cuma Hobi
              </div>

              <h1 className="hero-main-title reveal">
                Warkop
                <br />
                <em>Si Bontot</em>
              </h1>

              <p className="hero-sub reveal">
                Tempat nongkrong paling santai di
                Bojonggede. Kopi enak, cemilan
                nagih, suasana hangat cocok banget
                buat kamu yang mau lepas penat
                atau kejar deadline bareng.
              </p>

              <div className="d-flex flex-sm-row flex-column gap-3 reveal">

                <a
                  href="#menu"
                  className="btn-primary-hero"
                >
                  Lihat Menu
                  <i className="bi bi-arrow-right"></i>
                </a>

                <a
                  href="#about"
                  className="btn-secondary-hero"
                >
                  Kenali Kami Dulu
                </a>

              </div>

              <div className="hero-stats reveal">

                <div className="hero-stat-item">
                  <strong
                    className="counter"
                    data-target="5"
                  >
                    0
                  </strong>

                  <span>Tahun Berdiri</span>
                </div>

                <div className="hero-stat-divider"></div>

                <div className="hero-stat-item">
                  <strong
                    className="counter"
                    data-target="1200"
                  >
                    0
                  </strong>

                  <span>Pelanggan / Bulan</span>
                </div>

                <div className="hero-stat-divider"></div>

                <div className="hero-stat-item">
                  <strong
                    className="counter"
                    data-target="40"
                  >
                    0
                  </strong>

                  <span>Varian Menu</span>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      <div
        className="carousel-dots"
        id="carousel-dots"
      >
        {heroSlides.map((_, i) => (
          <button
            key={i}
            className={`cdot ${
              i === currentSlide
                ? "active"
                : ""
            }`}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setCurrentSlide(i)}
          ></button>
        ))}
      </div>
    </section>
  );
}