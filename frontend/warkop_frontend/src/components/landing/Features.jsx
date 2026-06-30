export default function Features() {
  return (
    <section className="container features-strip">
      <div className="row g-4 align-items-stretch">

        <div className="col-md-4 reveal">
          <div className="feat-card h-100">
            <div className="feat-icon-wrap">
              <i className="bi bi-cup-hot-fill"></i>
            </div>

            <div>
              <h5>Kopi & Minuman Favorit</h5>

              <p>
                Dari kopi hitam yang menemani begadang
                sampai es kopi susu aren yang sedang hits.
                Klasik maupun kekinian, semuanya ada.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 reveal">
          <div className="feat-card h-100 style-divider">
            <div className="feat-icon-wrap">
              <i className="bi bi-egg-fried"></i>
            </div>

            <div>
              <h5>Indomie & Cemilan Andalan</h5>

              <p>
                Indomie racikan khas Si Bontot,
                nasi goreng, roti bakar lumer,
                dan camilan yang bikin susah
                berhenti ngunyah.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 reveal">
          <div className="feat-card h-100">
            <div className="feat-icon-wrap">
              <i className="bi bi-wifi"></i>
            </div>

            <div>
              <h5>Nongkrong Tanpa Khawatir</h5>

              <p>
                Wi-Fi kencang, colokan tersedia,
                buka sampai malam. Cocok buat
                nugas, rapat santai, atau mabar
                sampai lupa waktu.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}