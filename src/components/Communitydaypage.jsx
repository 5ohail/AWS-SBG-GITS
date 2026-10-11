import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Calendar,
  Plus,
  Clock,
  Cloud,
  Cpu,
  GitBranch,
  Globe2,
  Layers,
  MapPin,
  Menu,
  Mic2,
  X,
  Boxes,
  Coffee,
  Users,
  Trophy,
  UtensilsCrossed,
  PartyPopper,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  eventInfo,
  stats,
  tracks,
  coreTeam,
  keynoteSpeakers,
  eventSpeakers,
  schedule,
  sponsors,
  faqs,
  venueSectionData,
  volunteersRow1,
  volunteersRow2,
  volunteersRow3,
} from "../utils/communityDayData.js";
import KonfHubRegistrationWidget from "../utils/KonfHubRegistrationWidget";
import Speakers from "../utils/CommunityDayPageRedesign/components/Speakers";
import CoreTeam from "../utils/CommunityDayPageRedesign/components/CoreTeam";
import Volunteers from "../utils/CommunityDayPageRedesign/components/Volunteers";
import "../utils/CommunityDayPageRedesign/styles/globals.css";
import "./Communitydaypage.css";
import heroPoster from "../assets/hero_cd.jpg";

gsap.registerPlugin(ScrollTrigger);

const sections = [
  ["About", "about"],
  ["Tracks", "tracks"],
  ["Speakers", "speakers"],
  ["Core Team", "team"],
  ["Volunteers", "volunteers"],
  ["Schedule", "schedule"],
  ["Venue", "venue"],
  ["Sponsors", "sponsors"],
  ["FAQ", "faq"],
];
const TRACK_ICONS = [Cloud, Cpu, Layers, GitBranch, Globe2, Boxes];
const SCHEDULE_ICONS = {
  registration: Coffee,
  talk: Mic2,
  panel: Users,
  quiz: Trophy,
  break: UtensilsCrossed,
  ceremony: PartyPopper,
};
const communityDaySpeakers = [
  ...keynoteSpeakers.map((speaker) => ({
    ...speaker,
    category: "KEYNOTE SPEAKER",
  })),
  ...eventSpeakers.map((speaker) => ({
    ...speaker,
    category: "SESSION SPEAKER",
  })),
].map((speaker, index) => ({
  ...speaker,
  number: String(index + 1).padStart(2, "0"),
  company: "",
  topic: "Session details will be announced soon.",
  tags: [],
  image: speaker.image
    ? `/${speaker.image.replace(/^\/+/, "")}`
    : "/assets/speakers/speaker-placeholder.svg",
  placeholder: !speaker.image,
}));
const communityCoreTeamRows = [coreTeam.slice(0, 4), coreTeam.slice(4)].map(
  (row) =>
    row.map((member, index) => ({
      ...member,
      id: `community-core-${member.name}-${index}`,
      shortRole: member.role,
    })),
);
const communityVolunteerRows = [
  volunteersRow1,
  volunteersRow2,
  volunteersRow3,
].map((row) =>
  row.map((volunteer) => ({
    ...volunteer,
    image: volunteer.image.startsWith("http")
      ? volunteer.image
      : `/${volunteer.image.replace(/^\/+/, "")}`,
  })),
);

function EventNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`event-nav ${scrolled ? "is-scrolled" : ""}`}>
      <a
        className="event-brand"
        href="#community-hero"
        onClick={() => setOpen(false)}
      >
        <span className="event-brand-mark">
          A<span>W</span>S
        </span>
        <span className="event-brand-name">
          Community Day <i>Udaipur</i>
        </span>
      </a>
      <nav
        className={`event-nav-links ${open ? "is-open" : ""}`}
        aria-label="Event navigation"
      >
        {sections.map(([label, id]) => (
          <a href={`#${id}`} key={id} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <KonfHubRegistrationWidget
          className="event-nav-register mobile-register"
          onClick={() => setOpen(false)}
        >
          Register <ArrowRight size={15} />
        </KonfHubRegistrationWidget>
      </nav>
      <KonfHubRegistrationWidget className="event-nav-register desktop-register">
        Register <ArrowRight size={15} />
      </KonfHubRegistrationWidget>
      <button
        className="event-menu-toggle"
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <p className={`event-eyebrow ${light ? "on-dark" : ""}`}>
      <span />
      {children}
    </p>
  );
}

function SectionHeading({ number, eyebrow, title, subtitle, light = false }) {
  return (
    <div className={`event-heading ${light ? "on-dark" : ""}`}>
      <div>
        <Eyebrow light={light}>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
      </div>
      <div className="event-heading-aside">
        <span>{number}</span>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

function EventTracks() {
  const sectionRef = useRef(null);
  const railRef = useRef(null);
  useEffect(() => {
    const section = sectionRef.current;
    const rail = railRef.current;
    if (
      !section ||
      !rail ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const cards = gsap.utils.toArray(".track-card", rail);
    const ctx = gsap.context(() => {
      if (window.matchMedia("(min-width: 900px)").matches) {
        const viewport = section.querySelector(".track-rail-clip");
        const distance = () =>
          Math.max(0, rail.scrollWidth - viewport.clientWidth);
        const settleDistance = () => Math.max(480, cards.length * 90);
        const railTravelDuration = 0.86;
        gsap.set(cards, {
          rotateY: (i) => (i % 2 ? 8 : -8),
          z: -24,
          scale: 0.96,
        });
        const sequence = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() + settleDistance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        sequence.to(
          rail,
          { x: () => -distance(), duration: railTravelDuration, ease: "none" },
          0,
        );
        sequence.to(
          cards,
          {
            rotateY: 0,
            z: 0,
            scale: 1,
            duration: 1 - railTravelDuration,
            ease: "none",
          },
          railTravelDuration,
        );
      }
    }, section);
    return () => ctx.revert();
  }, []);
  return (
    <section
      className="tracks-section event-section-dark"
      id="tracks"
      ref={sectionRef}
    >
      <div className="tracks-inner">
        <SectionHeading
          number="02 / 07"
          eyebrow="What you will explore"
          title="Event tracks"
          subtitle="Six threads across cloud, AI, architecture, and community — all at 3rd Space, Udaipur."
          light
        />
        <div className="track-rail-clip">
          <div className="track-rail" ref={railRef}>
            {tracks.map((track, i) => {
              const Icon = TRACK_ICONS[i % TRACK_ICONS.length];
              return (
                <article
                  className={`track-card track-card-${i % 3}`}
                  key={track}
                >
                  <div className="track-card-top">
                    <span>TRACK / 0{i + 1}</span>
                    <Icon size={23} strokeWidth={1.5} />
                  </div>
                  <div className="track-card-arch" aria-hidden="true">
                    <span>
                      <Icon size={52} strokeWidth={1} />
                    </span>
                  </div>
                  <h3>{track}</h3>
                  <div className="track-card-foot">
                    <span>COMMUNITY DAY · GITS</span>
                    <ArrowRight size={17} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <div className="track-scroll-note">
          <span>Scroll to explore tracks</span>
          <ArrowDown size={15} />
        </div>
      </div>
    </section>
  );
}

function ScheduleTimeline() {
  const wrapRef = useRef(null);
  const lineRef = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    const line = lineRef.current;
    if (
      !wrap ||
      !line ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top 68%",
            end: "bottom 62%",
            scrub: true,
          },
        },
      );
      gsap.utils.toArray(".schedule-row", wrap).forEach((row, i) => {
        const side = i % 2 ? 1 : -1;
        gsap.fromTo(
          row.querySelector(".schedule-card"),
          { x: side * 34, rotateY: side * 5, z: -24 },
          {
            x: 0,
            rotateY: 0,
            z: 0,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top 84%",
              end: "top 53%",
              scrub: true,
            },
          },
        );
        ScrollTrigger.create({
          trigger: row,
          start: "top 62%",
          end: "bottom 38%",
          toggleClass: { targets: row, className: "is-active" },
        });
      });
    }, wrap);
    return () => ctx.revert();
  }, []);
  return (
    <div className="schedule-timeline" ref={wrapRef}>
      <span className="schedule-line" aria-hidden="true" />
      <span
        className="schedule-line-progress"
        ref={lineRef}
        aria-hidden="true"
      />
      {schedule.map((item, i) => {
        const Icon = SCHEDULE_ICONS[item.type] || Mic2;
        return (
          <article
            className={`schedule-row ${i % 2 ? "schedule-row-right" : "schedule-row-left"}`}
            key={`${item.title}-${i}`}
          >
            <span className="schedule-node">
              <Icon size={15} />
            </span>
            <div className="schedule-card">
              <time>{item.time}</time>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const answerId = `event-faq-answer-${index}`;
  return (
    <article className={`faq-item ${open ? "is-open" : ""}`}>
      <button
        className="faq-question"
        type="button"
        aria-expanded={open}
        aria-controls={answerId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="faq-index">{String(index + 1).padStart(2, "0")}</span>
        <span>{item.q}</span>
        <Plus size={18} />
      </button>
      <div className="faq-answer" id={answerId} aria-hidden={!open}>
        <p>{item.a}</p>
      </div>
    </article>
  );
}

function CommunityDayFooter() {
  return (
    <footer className="event-footer">
      <div className="event-footer-mark" aria-hidden="true">
        AWS<span> Udaipur</span>
      </div>
      <div className="event-footer-main">
        <div>
          <Eyebrow light>AWS STUDENT BUILDER GROUP · GITS</Eyebrow>
          <h2>
            Build something
            <br />
            <em>that reaches further.</em>
          </h2>
        </div>
        <a href="#community-hero" className="footer-back-top">
          Back to top <ArrowRight size={16} />
        </a>
      </div>
      <div className="event-footer-bottom">
        <span>AWS Community Day Udaipur</span>
        <span>
          © {new Date().getFullYear()} AWS Student Builder Group, GITS
        </span>
        <KonfHubRegistrationWidget>
          Register your interest
        </KonfHubRegistrationWidget>
      </div>
    </footer>
  );
}

export default function CommunityDayPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-kicker",
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, delay: 0.1, ease: "power3.out" },
      );
      gsap.fromTo(
        ".hero-title-line",
        { yPercent: 115, rotateX: -8 },
        {
          yPercent: 0,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.12,
          delay: 0.16,
          ease: "power4.out",
        },
      );
      gsap.fromTo(
        ".hero-summary, .hero-meta, .hero-actions",
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          delay: 0.34,
          ease: "power3.out",
        },
      );
      gsap.to(".about-ghost", {
        xPercent: -11,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  const sponsorItems = [
    ["PLATINUM", sponsors.platinum],
    ["GOLD", sponsors.gold],
    ["COMMUNITY PARTNERS", sponsors.community],
  ].flatMap(([group, list]) =>
    list.map((s, j) => ({ group, sponsor: s, key: `${group}-${s.name}-${j}` })),
  );

  return (
    <div className="cd-page">
      <EventNav />
      <main>
        <section className="event-hero" id="community-hero">
          <video
            className="event-hero-video"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={heroPoster}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/assets/back.mp4" type="video/mp4" />
          </video>
          <div className="hero-gridlines" aria-hidden="true" />
          <div className="hero-copy">
            <p className="hero-kicker">
              <span /> AWS STUDENT BUILDER GROUP · GITS{" "}
              <span className="hero-kicker-rule" />
            </p>
            <h1 className="hero-title">
              <span className="hero-title-line">Community</span>
              <span className="hero-title-line hero-title-second">
                Day <i>Udaipur</i>
              </span>
              {/* <span className="hero-title-year">2026</span> */}
            </h1>
            <p className="hero-summary">{eventInfo.tagline}</p>
            <div className="hero-meta">
              <span>
                <Calendar size={15} />
                {eventInfo.date}
              </span>
              <span>
                <Clock size={15} />
                {eventInfo.time}
              </span>
              <span>
                <MapPin size={15} />
                {eventInfo.city}
              </span>
            </div>
            <div className="hero-actions">
              <KonfHubRegistrationWidget className="event-cta">
                Register your interest <ArrowRight size={16} />
              </KonfHubRegistrationWidget>
              <span className="hero-scroll">
                <ArrowDown size={15} /> Scroll to explore
              </span>
            </div>
          </div>
          <div className="hero-side-note">
            <span>GITS · UDAIPUR</span>
            <span>01 — 06</span>
          </div>
        </section>

        <section className="about-section event-section-cream" id="about">
          <span className="about-ghost" aria-hidden="true">
            01
          </span>
          <div className="about-inner">
            <SectionHeading
              number="01 / 07"
              eyebrow="About AWS Community Day 2026"
              title="Building AWSome — together."
            />
            <div className="about-copy">
              <p className="about-lead">Cloud Clubs × Professionals</p>
              <div className="about-description">
                <p>
                  AWS Community Day Rajasthan brings developers, cloud
                  practitioners, DevOps and SRE professionals, students, and
                  open-source enthusiasts together at GITS to explore what’s
                  possible with AWS.
                </p>
                <p>
                  Interactive sessions, quizzes, contests, and hands-on learning
                  create space to discover modern technology stacks, exchange
                  ideas, and connect emerging talent with industry experience.
                </p>
              </div>
            </div>
            <div className="about-facts">
              <div>
                <span>DATE</span>
                <strong>{eventInfo.date}</strong>
                <small>{eventInfo.time}</small>
              </div>
              <div>
                <span>VENUE</span>
                <strong>{eventInfo.location}</strong>
                <small>{eventInfo.venue}</small>
              </div>
              <div>
                <span>LOCATION</span>
                <strong>{eventInfo.city}</strong>
                <small>{eventInfo.college}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="info-strip">
          <div className="info-strip-label">
            <span>THE DAY AT A GLANCE</span>
            <span>01 — 04</span>
          </div>
          {stats.map((item) => (
            <div className="info-stat" key={item.label}>
              <strong>
                {item.value}
                {item.suffix}
              </strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        <EventTracks />
        <div className="community-day-redesign cd-speakers-theme cd-community-sections">
          <Speakers speakers={communityDaySpeakers} />
          <CoreTeam rows={communityCoreTeamRows} />
          <Volunteers rows={communityVolunteerRows} />
        </div>

        <section className="schedule-section event-section-night" id="schedule">
          <div className="schedule-inner">
            <SectionHeading
              number="04 / 07"
              eyebrow="One desert day"
              title="A day with room to build."
              subtitle="Sunrise check-in to sunset closing — times may shift slightly as speakers lock in."
              light
            />
            <ScheduleTimeline />
          </div>
        </section>

        <section className="venue-section event-section-night" id="venue">
          <div className="venue-inner">
            <SectionHeading
              number="05 / 07"
              eyebrow={venueSectionData.heading.eyebrow}
              title={venueSectionData.heading.title}
              subtitle={venueSectionData.heading.subtitle}
              light
            />

            <div
              className="venue-collage"
              aria-label="Udaipur and community moments"
            >
              {venueSectionData.photos.map((photo) => (
                <figure
                  className={`venue-photo venue-photo-${photo.layout}`}
                  key={photo.src}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    <span>{photo.label}</span>
                    {photo.caption && <strong>{photo.caption}</strong>}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="venue-details">
              <div className="venue-address">
                <span className="venue-detail-label">THE VENUE</span>
                <h3>{venueSectionData.name}</h3>
                <p>
                  {venueSectionData.address} · {venueSectionData.room}
                </p>
                <a
                  href={venueSectionData.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="venue-map-link"
                >
                  <MapPin size={15} />
                  Open in Google Maps
                  <ArrowRight size={15} />
                </a>
              </div>
              <div className="venue-facts">
                <div>
                  <span className="venue-detail-label">WHEN</span>
                  <strong>{venueSectionData.date}</strong>
                  <small>{venueSectionData.time}</small>
                </div>
                <div>
                  <span className="venue-detail-label">WHERE</span>
                  <strong>{venueSectionData.city}</strong>
                  <small>{venueSectionData.room}</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sponsors-section event-section-cream" id="sponsors">
          <div className="sponsors-inner">
            <SectionHeading
              number="06 / 07"
              eyebrow="Made possible by"
              title="Community, together."
              light
            />
            <div className="sponsor-scroll-note">
              <span>SPONSORS & COMMUNITY PARTNERS</span>
              <span>
                <ArrowRight size={14} /> CONTINUOUS SCROLL · PAUSE ON HOVER
              </span>
            </div>
            <div
              className="sponsor-marquee"
              role="region"
              aria-label="Sponsors and community partners"
              tabIndex={0}
            >
              <div className="sponsor-marquee-track">
                {[0, 1].flatMap((copy) =>
                  sponsorItems.map(({ group, sponsor, key }) => (
                    <div
                      className="sponsor-wordmark"
                      key={`${copy}-${key}`}
                      aria-hidden={copy === 1}
                    >
                      <span className="sponsor-category">{group}</span>
                      <strong>{sponsor.name}</strong>
                      <ArrowRight size={16} />
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section event-section-night" id="faq">
          <div className="faq-inner">
            <SectionHeading
              number="07 / 07"
              eyebrow="Good to know"
              title="Questions, answered."
              subtitle="Everything you need to know before joining us in Udaipur."
              light
            />
            <div className="faq-list">
              {faqs.map((item, i) => (
                <FAQItem item={item} index={i} key={item.q} />
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta-section" id="register">
          <div>
            <Eyebrow>{eventInfo.date} · 3rd Space, UDAIPUR</Eyebrow>
            <h2>
              Come build the cloud
              <br />
              <em>in Udaipur.</em>
            </h2>
            <KonfHubRegistrationWidget className="event-cta">
              Register your interest <ArrowRight size={16} />
            </KonfHubRegistrationWidget>
          </div>
          <span className="final-cta-orbit" aria-hidden="true" />
        </section>
      </main>
      <CommunityDayFooter />
    </div>
  );
}
