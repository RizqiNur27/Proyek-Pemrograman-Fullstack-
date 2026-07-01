import { useCart } from '../../context/CartContext';

export default function Navbar({
  isScrolled,
  timeStr,
  onNavigate,
}) {

  const { itemCount, setCartOpen } = useCart();

  const handleCartClick = () => {
    if (onNavigate) onNavigate('menu');
    setTimeout(() => {
      setCartOpen(true);
    }, 100);
  };

  return (
    <nav
      id="mainNav"
      className={`navbar navbar-expand-lg fixed-top ${
        isScrolled ? "scrolled" : ""
      }`}
    >
      <div className="container">
        <a
          className="navbar-brand d-flex align-items-center"
          href="#hero"
        >
          <img
            src="../src/assets/img/logo-warkop.svg"
            alt="Logo Warkop Si Bontot"
            className="navbar-logo-img"
          />

          <div className="navbar-brand-text ms-2">
            Warkop Si Bontot
            <span>Deadline Enjoyer</span>
          </div>
        </a>

        <div
          id="live-clock"
          className="d-none d-lg-flex ms-auto me-3"
        >
          <i className="bi bi-clock"></i>

          <span id="clock-display">
            {timeStr}
          </span>
        </div>

        <button
          id="navToggleBtn"
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <i className="bi bi-list fs-2 text-white"></i>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-3 mt-3 mt-lg-0">

            <li className="nav-item">
              <a className="nav-link" href="#hero">
                Beranda
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#about">
                Tentang
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#menu">
                Menu
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#tim">
                Tim Kami
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#testimoni">
                Testimoni
              </a>
            </li>

            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
              <button
                className="btn-nav-order"
                onClick={() => onNavigate?.("menu")}
              >
                Pesan Sekarang!
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}