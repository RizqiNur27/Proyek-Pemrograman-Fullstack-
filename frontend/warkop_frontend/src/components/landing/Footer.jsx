import logo from "../../assets/img/logo-warkop.svg";

export default function Footer({
  isOpen,
  showScrollTop,
  scrollToTop,
}) {
  return (
    <>
      <footer id="kontak">
        <div className="container footer-top">
          <div className="row g-5">

            <div className="col-lg-5 reveal">
              <img
                src={logo}
                alt="Warkop Si Bontot Logo"
                className="footer-logo-img"
              />

              <div className="footer-brand-name">
                Warkop Si Bontot
              </div>

              <p className="footer-tagline">
                "Tukang Ngopi, Cari Duit Cuma Hobi."
              </p>

              <div className="footer-address">
                <i className="bi bi-geo-alt-fill"></i>

                <span>
                  Jl. Tegar Beriman No.6,
                  Bojong Baru,
                  Kec. Bojonggede,
                  Kabupaten Bogor,
                  Jawa Barat 16920
                </span>
              </div>
            </div>

            <div className="col-lg-3 offset-lg-1 reveal">

              <div className="footer-heading">
                Jam Operasional
              </div>

              <div
                className={`open-status ${
                  isOpen ? "open" : "closed"
                }`}
              >
                <span className="dot"></span>

                <span>
                  {isOpen
                    ? "Sedang Buka"
                    : "Sedang Tutup"}
                </span>
              </div>

              <div className="footer-ops-item">
                <strong>Senin – Jumat</strong>

                <span>06.00 – 22.00 WIB</span>
              </div>

              <div className="footer-ops-item">
                <strong>Sabtu – Minggu</strong>

                <span>07.00 – 23.00 WIB</span>
              </div>

            </div>

            <div className="col-lg-3 reveal">

              <div className="footer-heading">
                Lokasi
              </div>

              <div className="map-holder">

                <iframe
                  src="https://maps.google.com/maps?q=Bojonggede&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="140"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Lokasi Warkop Si Bontot"
                ></iframe>

              </div>

            </div>

          </div>
        </div>

        <div className="footer-bottom">
          <div className="container d-flex flex-sm-row flex-column align-items-center justify-content-between gap-2">

            <small>
              © 2026 Warkop Si Bontot.
              Semua hak dilindungi.
            </small>

            <small>
              Dibuat Oleh Deadline Enjoyer
            </small>

          </div>
        </div>
      </footer>

      <button
        id="scrollTop"
        className={showScrollTop ? "show" : ""}
        onClick={scrollToTop}
        aria-label="Scroll Top"
      >
        <i className="bi bi-arrow-up"></i>
      </button>
    </>
  );
}