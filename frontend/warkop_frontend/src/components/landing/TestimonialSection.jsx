export default function TestimonialSection({
  testiData,
  testiPage,
  TESTI_PER_PAGE,
  nextTesti,
  prevTesti,
}) {
  return (
    <section id="testimoni">
      <div className="container">
        <div className="text-center mb-5 reveal">
          <h2 className="section-heading mt-1">
            Kata Mereka yang Sudah Mampir
          </h2>
        </div>

        <div className="position-relative px-md-5">
          <div className="row g-4">

            {testiData
              .slice(
                testiPage * TESTI_PER_PAGE,
                testiPage * TESTI_PER_PAGE +
                  TESTI_PER_PAGE
              )
              .map((t, idx) => (
                <div
                  key={idx}
                  className="col-md-4 reveal"
                >
                  <div className="testi-card">

                    <div className="testi-stars">
                      {"★".repeat(t.stars)}
                      {"☆".repeat(5 - t.stars)}
                    </div>

                    <p className="testi-text">
                      "{t.text}"
                    </p>

                    <div className="testi-author">

                      <div className="testi-avatar">
                        {t.name.charAt(0)}
                      </div>

                      <div>
                        <div className="testi-author-name">
                          {t.name}
                        </div>

                        <div className="testi-author-meta">
                          {t.meta}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              ))}

          </div>

          <button
            className="btn-testi-nav prev"
            onClick={prevTesti}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <button
            className="btn-testi-nav next"
            onClick={nextTesti}
          >
            <i className="bi bi-chevron-right"></i>
          </button>

        </div>
      </div>
    </section>
  );
}