import { useState, useEffect } from "react";
import {
  menuData,
  testiData,
  heroSlides,
} from "../assets/js/landingData";

export default function useLandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [menuFilter, setMenuFilter] = useState("all");
  const [testiPage, setTestiPage] = useState(0);

  const [timeStr, setTimeStr] = useState("00:00:00");
  const [isOpen, setIsOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const TESTI_PER_PAGE = 3;

  // ======================
  // Hero Slider
  // ======================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // ======================
  // Jam Operasional
  // ======================
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      setTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour12: false,
        })
      );

      const day = now.getDay();
      const mins = now.getHours() * 60 + now.getMinutes();

      if (day >= 1 && day <= 5) {
        setIsOpen(mins >= 360 && mins < 1320);
      } else {
        setIsOpen(mins >= 420 && mins < 1380);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ======================
  // Navbar Scroll
  // ======================
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  // ======================
  // Reveal Animation
  // ======================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    document
      .querySelectorAll(".reveal")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [menuFilter, testiPage]);

  // ======================
  // Counter Animation
  // ======================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const target = Number(e.target.dataset.target);

            const duration = 1600;

            const step = target / (duration / 16);

            let current = 0;

            const timer = setInterval(() => {
              current += step;

              if (current >= target) {
                e.target.textContent =
                  target.toLocaleString("id-ID");

                clearInterval(timer);
              } else {
                e.target.textContent =
                  Math.floor(current).toLocaleString("id-ID");
              }
            }, 16);

            observer.unobserve(e.target);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    document
      .querySelectorAll(".counter")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // ======================
  // Scroll Top
  // ======================
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================
  // Testimoni
  // ======================
  const nextTesti = () => {
    const max =
      Math.ceil(testiData.length / TESTI_PER_PAGE) - 1;

    setTestiPage((prev) =>
      prev < max ? prev + 1 : 0
    );
  };

  const prevTesti = () => {
    const max =
      Math.ceil(testiData.length / TESTI_PER_PAGE) - 1;

    setTestiPage((prev) =>
      prev > 0 ? prev - 1 : max
    );
  };

  // ======================
  // Filter Menu
  // ======================
  const filteredMenu =
    menuFilter === "all"
      ? menuData
      : menuData.filter(
          (item) => item.filter === menuFilter
        );

  return {
    currentSlide,
    setCurrentSlide,

    menuFilter,
    setMenuFilter,

    testiPage,

    timeStr,
    isOpen,

    isScrolled,
    showScrollTop,

    TESTI_PER_PAGE,

    filteredMenu,

    heroSlides,
    testiData,

    scrollToTop,
    nextTesti,
    prevTesti,
  };
}