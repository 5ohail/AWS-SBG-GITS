import React, { useEffect, useRef, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Instagram = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Whatsapp = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.6 1.42 5.16L2 22l4.97-1.38A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18a7.95 7.95 0 0 1-4.04-1.1l-.29-.17-2.95.82.79-2.88-.19-.3A7.96 7.96 0 1 1 12 20zm4.25-5.43c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.91-.13.15-.26.17-.49.06-.23-.11-.95-.35-1.82-1.11-.67-.6-1.13-1.34-1.26-1.57-.13-.23-.01-.35.1-.47l.34-.39c.11-.13.15-.22.23-.37.08-.15.04-.28-.02-.39-.06-.11-.51-1.23-.7-1.69-.18-.44-.37-.38-.51-.39h-.44c-.15 0-.39.06-.6.28-.21.23-.79.77-.79 1.87s.81 2.17.92 2.32c.11.15 1.58 2.41 3.83 3.38.54.23.96.37 1.29.47.55.17 1.05.14 1.45.09.44-.07 1.36-.56 1.55-1.1.19-.53.19-.98.13-1.08-.06-.09-.21-.15-.44-.26z" />
  </svg>
);

const Linkedin = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const NAV_ITEMS = [
  { label: "Home", id: "home", kind: "hash" },
  { label: "About", id: "about", kind: "hash" },
  { label: "What We Do", id: "what-we-do", kind: "hash" },
  { label: "Events", id: "events", kind: "hash" },
  { label: "Gallery", id: "gallery", kind: "hash" },
  { label: "Team", id: "core-team", kind: "hash" },
  // { label: "Community Day", id: "community-day", kind: "route", to: "/community-day" },
  { label: "Contact", id: "contact", kind: "hash" },
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 80;
  const bodyRect = document.body.getBoundingClientRect().top;
  const elementRect = el.getBoundingClientRect().top;
  const elementPosition = elementRect - bodyRect;
  window.scrollTo({
    top: elementPosition - offset,
    behavior: "smooth",
  });
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const progressRef = useRef(null);

  const routeSection =
    location.pathname === "/community-day"
      ? "community-day"
      : location.pathname === "/gallery"
        ? "gallery"
        : null;

  useEffect(() => {
    const desktopViewport = window.matchMedia("(min-width: 1101px)");
    const closeMenuOnDesktop = (event) => {
      if (event.matches) setIsOpen(false);
    };

    desktopViewport.addEventListener("change", closeMenuOnDesktop);
    return () =>
      desktopViewport.removeEventListener("change", closeMenuOnDesktop);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  useEffect(() => {
    let scrollFrame = 0;
    const updateProgress = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        totalHeight > 0
          ? Math.min(Math.max(window.scrollY / totalHeight, 0), 1)
          : 0;

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };
    const scheduleUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        const scrollY = window.scrollY;
        const scrolled = scrollY > 20;
        setIsScrolled((previous) =>
          previous === scrolled ? previous : scrolled,
        );

        updateProgress();

        if (routeSection) {
          setActiveSection((previous) =>
            previous === routeSection ? previous : routeSection,
          );
          return;
        }

        let currentSection = "home";
        for (const item of NAV_ITEMS) {
          if (item.kind !== "hash") continue;
          const el = document.getElementById(item.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 120 && rect.bottom >= 120) {
              currentSection = item.id;
              break;
            }
          }
        }
        setActiveSection((previous) =>
          previous === currentSection ? previous : currentSection,
        );
      });
    };

    const resizeObserver =
      "ResizeObserver" in window
        ? new ResizeObserver(scheduleUpdate)
        : null;
    resizeObserver?.observe(document.documentElement);
    if (document.body) resizeObserver?.observe(document.body);

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("load", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);

    let isMounted = true;
    document.fonts?.ready.then(() => {
      if (isMounted) scheduleUpdate();
    });

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(scrollFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("load", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
    };
  }, [routeSection]);

  const goHomeSection = (id) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    scrollToSection(id);
  };

  const handleNav = (item) => {
    if (item.kind === "route") {
      setIsOpen(false);
      navigate(item.to);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (item.id === "gallery" && location.pathname !== "/") {
      setIsOpen(false);
      navigate("/gallery");
      return;
    }
    goHomeSection(item.id);
  };

  const goHome = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/#home");
      return;
    }
    scrollToSection("home");
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled glass" : ""}`}>
      <div
        ref={progressRef}
        className="scroll-progress-bar"
        aria-hidden="true"
      />

      <div className="navbar-container container">
        <a href="/#home" className="logo" onClick={goHome}>
          <span>AWS</span>
          <em className="logo-sub">SBG GITS</em>
        </a>

        <div className="nav-links-desktop">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className={`nav-link-btn ${activeSection === item.id ? "active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="nav-actions-desktop">
          {/* <button
            className="action-icon-btn"
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button> */}

          <a
            href="https://www.instagram.com/student_builder_group"
            target="_blank"
            rel="noreferrer"
            className="action-icon-btn"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>

          <a
            href="https://www.linkedin.com/company/aws-cloud-club-gits"
            target="_blank"
            rel="noreferrer"
            className="action-icon-btn"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>

          <button
            type="button"
            onClick={() => {
              window.open(
                "https://chat.whatsapp.com/CoQDbQYdD9e67R3RpKAsWA",
                "_blank",
                "noopener,noreferrer",
              );
            }}
            className="btn btn-secondary resume-btn"
          >
            <Whatsapp size={18} />
            <span>Join Us</span>
          </button>
        </div>

        <div className="nav-mobile-controls">
          {/* <button
            className="action-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button> */}

          <button
            className="hamburger-btn"
            onClick={() => setIsOpen((open) => !open)}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu-drawer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu-drawer"
        className={`mobile-menu-drawer ${isOpen ? "open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="mobile-menu-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className={`mobile-nav-link ${activeSection === item.id ? "active" : ""}`}
            >
              {item.label}
            </button>
          ))}

          <div className="mobile-socials-row">
            <a
              href="https://www.instagram.com/student_builder_group"
              target="_blank"
              rel="noreferrer"
              className="action-icon-btn"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/aws-cloud-club-gits"
              target="_blank"
              rel="noreferrer"
              className="action-icon-btn"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <button
              type="button"
              onClick={() => {
                window.open(
                  "https://chat.whatsapp.com/CoQDbQYdD9e67R3RpKAsWA",
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              className="btn btn-secondary mobile-resume-btn"
            >
              <Whatsapp size={16} />
              <span>Join Us</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
