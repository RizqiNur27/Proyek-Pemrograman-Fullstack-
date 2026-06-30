const teamMembers = [
  {
    img: "../src/assets/img/hanif.jpeg",
    name: "M. Shidqi Hanif Firdaus",
    role: "Founder",
  },
  {
    img: "../src/assets/img/harun.jpg",
    name: "Harun Yahya",
    role: "Head Barista",
  },
  {
    img: "../src/assets/img/syahril.jpg",
    name: "Syahril Arif Adriansyah",
    role: "Operasional",
  },
  {
    img: "../src/assets/img/rehan.jpeg",
    name: "Achmad Raihan",
    role: "Roaster",
  },
  {
    img: "../src/assets/img/omat.jpg",
    name: "M. Rizqi Nurrohmat",
    role: "Kepala Dapur",
  },
];

export default function TeamSection() {
  return (
    <section id="tim">
      <div className="container">
        <div className="text-center mb-5 reveal">
          <h2 className="section-heading mt-1">
            Orang-Orang di Balik Si Bontot
          </h2>

          <p
            className="text-muted mt-2 mx-auto"
            style={{
              maxWidth: "480px",
              fontSize: ".9rem",
            }}
          >
            Mereka yang setiap hari hadir menyiapkan
            racikan terbaik untuk kamu.
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          {teamMembers.map((member, i) => (
            <div
              key={i}
              className="col-6 col-md-4 col-lg-2-custom reveal"
            >
              <div className="team-card">
                <div className="team-img-wrap">
                  <img
                    src={member.img}
                    alt={member.name}
                  />
                </div>

                <h5>{member.name}</h5>

                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}