import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "./KonfHubRegistrationWidget.css";

const REGISTRATION_URL =
  "https://konfhub.com/widget/id/6809de9d-d37e-4201-837a-3e04d0359f4e";
const RegistrationContext = createContext(null);

export function KonfHubRegistrationProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const closeButtonRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus();
    };
  }, [isOpen]);

  const openRegistration = (opener) => {
    openerRef.current = opener;
    setFrameLoaded(false);
    setIsOpen(true);
  };

  const closeRegistration = () => setIsOpen(false);

  return (
    <RegistrationContext.Provider value={{ openRegistration }}>
      {children}
      {isOpen && (
        <div
          className="konfhub-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRegistration();
          }}
        >
          <section
            className="konfhub-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="konfhub-modal-title"
          >
            <header className="konfhub-modal-header">
              <div>
                <p className="konfhub-modal-eyebrow">AWS COMMUNITY DAY</p>
                <h2 id="konfhub-modal-title">
                  Register for AWS Student Community Day
                </h2>
              </div>
              <div className="konfhub-modal-actions">
                <a
                  className="konfhub-open-full-page"
                  href={REGISTRATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open full page <span aria-hidden="true">↗</span>
                </a>
                <button
                  ref={closeButtonRef}
                  className="konfhub-modal-close"
                  type="button"
                  onClick={closeRegistration}
                  aria-label="Close registration"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </header>
            <div className="konfhub-registration-frame-wrap">
              {!frameLoaded && (
                <div className="konfhub-registration-loading" role="status">
                  <span className="konfhub-registration-spinner" />
                  <span>Loading registration…</span>
                </div>
              )}
              <iframe
                className={`konfhub-registration-frame${frameLoaded ? " is-loaded" : ""}`}
                src={REGISTRATION_URL}
                id="konfhub-widget"
                title="Register for AWS Student Community Day"
                width="100%"
                height="500"
                allow="payment *; clipboard-write"
                allowFullScreen
                onLoad={() => setFrameLoaded(true)}
              />
            </div>
          </section>
        </div>
      )}
    </RegistrationContext.Provider>
  );
}

export default function KonfHubRegistrationWidget({
  className = "",
  children = "Register Now",
  onClick,
  ...buttonProps
}) {
  const registration = useContext(RegistrationContext);
  if (!registration) {
    throw new Error(
      "KonfHubRegistrationWidget must be rendered inside KonfHubRegistrationProvider.",
    );
  }

  const handleClick = (event) => {
    registration.openRegistration(event.currentTarget);
    onClick?.(event);
  };

  return (
    <button
      {...buttonProps}
      type="button"
      className={`konfhub-trigger ${className}`.trim()}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
