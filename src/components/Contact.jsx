import React, { useRef, useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";
import "./Contact.css";

const RATE_LIMIT_STORAGE_KEY = "contact-form-rate-limit";
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_COOLDOWN_MS = 30 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;

const idleStatus = { state: "idle", message: "" };

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

function getRateLimitRecord() {
  const stored = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  if (!stored) return { submittedAt: [], lastAttemptAt: 0 };

  const record = JSON.parse(stored);
  return {
    submittedAt: Array.isArray(record.submittedAt)
      ? record.submittedAt.filter(
          (timestamp) =>
            Number.isSafeInteger(timestamp) &&
            Date.now() - timestamp < RATE_LIMIT_WINDOW_MS,
        )
      : [],
    lastAttemptAt: Number.isSafeInteger(record.lastAttemptAt)
      ? record.lastAttemptAt
      : 0,
  };
}

function getRateLimitMessage(record, now) {
  const cooldownRemaining = record.lastAttemptAt + RATE_LIMIT_COOLDOWN_MS - now;
  if (cooldownRemaining > 0) {
    return `Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds before submitting again.`;
  }

  if (record.submittedAt.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    const windowRemaining = record.submittedAt[0] + RATE_LIMIT_WINDOW_MS - now;
    return `Submission limit reached. Please try again in ${Math.ceil(windowRemaining / 60000)} minutes.`;
  }

  return "";
}

function FormStatus({ status }) {
  if (!status.message) return null;

  return (
    <p
      className={`form-status form-status-${status.state}`}
      role="status"
      aria-live="polite"
    >
      {status.message}
    </p>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [subscriptionEmail, setSubscriptionEmail] = useState("");
  const [messageStatus, setMessageStatus] = useState(idleStatus);
  const [subscriptionStatus, setSubscriptionStatus] = useState(idleStatus);
  const isSubmitting = useRef(false);

  const handleMessageChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setMessageStatus(idleStatus);
  };

  const handleSubmission = async (event, type) => {
    event.preventDefault();
    if (isSubmitting.current) return;

    const setStatus =
      type === "message" ? setMessageStatus : setSubscriptionStatus;
    setStatus({ state: "sending", message: "" });
    isSubmitting.current = true;

    let record;
    let now;
    try {
      now = Date.now();
      record = getRateLimitRecord();
      const rateLimitMessage = getRateLimitMessage(record, now);
      if (rateLimitMessage) {
        setStatus({ state: "limited", message: rateLimitMessage });
        isSubmitting.current = false;
        return;
      }

      record.lastAttemptAt = now;
      window.localStorage.setItem(
        RATE_LIMIT_STORAGE_KEY,
        JSON.stringify(record),
      );
    } catch (error) {
      console.error("Could not check the contact form rate limit.", error);
      setStatus({
        state: "error",
        message:
          "We couldn't verify the submission limit. Please enable browser storage and try again.",
      });
      isSubmitting.current = false;
      return;
    }

    const email =
      type === "message" ? formData.email.trim() : subscriptionEmail.trim();
    const submission =
      type === "message"
        ? {
            username: formData.name.trim(),
            email,
            message: formData.message.trim(),
          }
        : { email };
    const collectionName = type === "message" ? "messages" : "emails";

    try {
      const [{ addDoc, collection }, { db }] = await Promise.all([
        import("firebase/firestore"),
        import("../firebase"),
      ]);
      await addDoc(collection(db, collectionName), submission);

      record.submittedAt.push(now);
      window.localStorage.setItem(
        RATE_LIMIT_STORAGE_KEY,
        JSON.stringify(record),
      );

      if (type === "message") {
        setFormData({ name: "", email: "", message: "" });
        setMessageStatus({
          state: "success",
          message: "Your message was sent successfully.",
        });
      } else {
        setSubscriptionEmail("");
        setSubscriptionStatus({
          state: "success",
          message: "You are subscribed successfully.",
        });
      }
    } catch (error) {
      console.error("Could not save the contact form submission.", error);
      const errorCode =
        error instanceof Error && "code" in error ? ` (${error.code})` : "";
      setStatus({
        state: "error",
        message: `Your submission could not be saved${errorCode}. Check the Firestore rules and project configuration, then try again.`,
      });
    } finally {
      isSubmitting.current = false;
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header text-center cloud-journey-heading">
          <p className="contact-kicker">AWS STUDENT BUILDER CLUB · GITS</p>
          <h2 className="section-title">Start Your Cloud Journey</h2>
          <div className="section-underline" />
          <p className="section-subtitle">
            Become part of a community where students learn, build, and grow
            together through AWS workshops, projects, hackathons, and technical
            sessions.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info-panel glass">
            <h3 className="contact-sub-title">Why Join Us?</h3>
            <p className="contact-info-desc">
              Whether you're just getting started with cloud computing or
              already building on AWS, our community offers hands-on workshops,
              collaborative projects, technical sessions, hackathons, and
              networking opportunities to help you grow.
            </p>

            <form
              onSubmit={(event) => handleSubmission(event, "subscription")}
              className="contact-form-left"
            >
              <div className="form-group">
                <label htmlFor="subscription-email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="subscription-email"
                  name="subscriptionEmail"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={subscriptionEmail}
                  onChange={(event) => {
                    setSubscriptionEmail(event.target.value);
                    setSubscriptionStatus(idleStatus);
                  }}
                  placeholder="john@example.com"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={subscriptionStatus.state === "sending"}
                className={`btn form-submit-btn ${subscriptionStatus.state === "success" ? "btn-success" : "btn-premium"}`}
              >
                {subscriptionStatus.state === "sending" ? (
                  <>
                    <span>Subscribing...</span>
                    <div className="form-spinner" />
                  </>
                ) : subscriptionStatus.state === "success" ? (
                  <>
                    <span>Subscribed Successfully</span>
                    <CheckCircle2 size={16} />
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send size={16} />
                  </>
                )}
              </button>
              <FormStatus status={subscriptionStatus} />
            </form>

            <div className="contact-socials-grid">
              <h4 className="socials-title">Connect With Us</h4>
              <div className="socials-row">
                <a
                  href="https://www.instagram.com/student_builder_group"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon-btn"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.linkedin.com/company/aws-cloud-club-gits"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon-btn"
                  title="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&to=bsuthar2024@gmail.com"
                  target="_blank"
                  className="social-icon-btn"
                  title="Email"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>

          <form
            onSubmit={(event) => handleSubmission(event, "message")}
            className="contact-form glass"
          >
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleMessageChange}
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleMessageChange}
                  placeholder="john@example.com"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group text">
              <label htmlFor="contact-message" className="form-label">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                maxLength={5000}
                rows="6"
                value={formData.message}
                onChange={handleMessageChange}
                placeholder="Hi, I'd like to join the AWS Student Builder Club..."
                className="form-input form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={messageStatus.state === "sending"}
              className={`btn form-submit-btn ${messageStatus.state === "success" ? "btn-success" : "btn-premium"}`}
            >
              {messageStatus.state === "sending" ? (
                <>
                  <span>Sending Message...</span>
                  <div className="form-spinner" />
                </>
              ) : messageStatus.state === "success" ? (
                <>
                  <span>Message Sent!</span>
                  <CheckCircle2 size={16} />
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send size={16} />
                </>
              )}
            </button>
            <FormStatus status={messageStatus} />
          </form>
        </div>
      </div>
    </section>
  );
}
