import profile from "../../assets/img/warkop-profile.webp";
export default function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="row g-5 align-items-center">

          <div className="col-lg-5 reveal">
            <div className="about-img-wrap">
              <img
                src="../src/assets/img/warkop-profile.webp"
                alt="Suasana Warkop Si Bontot"
              />

              <div className="about-badge">
                <strong
                  className="counter"
                  data-target="5"
                >
                  0
                </strong>

                <span>Tahun Melayani</span>
              </div>
            </div>
          </div>

          <div className="col-lg-7 reveal">

            <span className="section-eyebrow">
              Teman Si Bontot
            </span>

            <h2 className="section-heading mb-4">
              Markas Nongkrong
              <br />
              Favorit Anak Muda
            </h2>

            <p className="lead-text">
              Warkop Si Bontot hadir buat kamu yang ingin
              nongkrong nyaman tanpa bikin dompet pusing.
              Mau nugas, mabar, ngobrol sampai larut,
              atau sekadar cari tempat ngopi dengan
              suasana yang pas? Di sini tempatnya.
            </p>

            <div className="about-point">
              <div className="about-point-icon">
                <i className="bi bi-award-fill"></i>
              </div>

              <p>
                <strong>Rasa Tidak Main-Main:</strong>
                {" "}
                Kopi, susu, dan bahan-bahan pilihan
                yang diracik agar setiap tegukan
                benar-benar terasa sepadan.
              </p>
            </div>

            <div className="about-point">
              <div className="about-point-icon">
                <i className="bi bi-moon-stars-fill"></i>
              </div>

              <p>
                <strong>Nongkrong Sampai Puas:</strong>
                {" "}
                Buka sampai malam, cocok untuk yang
                sedang mengejar deadline atau mabar
                hingga lupa waktu.
              </p>
            </div>

            <div className="about-point">
              <div className="about-point-icon">
                <i className="bi bi-wallet2"></i>
              </div>

              <p>
                <strong>Harga Tetap Waras:</strong>
                {" "}
                Nongkrong estetik tidak harus mahal.
                Makan, minum, dan tetap aman di
                kantong mahasiswa.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}