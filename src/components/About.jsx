import React, { useEffect, useRef } from 'react';
import { eventData } from '../data/event';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Independent line reveal animation
      const lines = headlineRef.current?.querySelectorAll('.reveal-line');
      if (lines && lines.length > 0) {
        gsap.fromTo(
          lines,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-32 bg-[#030303] text-white border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Index */}
        <div className="flex items-center gap-4 mb-16">
          <span className="text-xs font-mono font-medium text-zinc-400">02</span>
          <div className="w-12 h-[1px] bg-white/20" />
          <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
            ORIGIN & VISION
          </span>
        </div>

        {/* Large Editorial Headline with Independent Line Reveals */}
        <div ref={headlineRef} className="max-w-5xl mb-20 font-display">
          <div className="overflow-hidden">
            <h2 className="reveal-line text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1.05]">
              A COMMUNITY
            </h2>
          </div>
          <div className="overflow-hidden">
            <h2 className="reveal-line text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-zinc-300 leading-[1.05]">
              BUILT AROUND
            </h2>
          </div>
          <div className="overflow-hidden">
            <h2 className="reveal-line text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gradient-gold leading-[1.05]">
              THE CLOUD.
            </h2>
          </div>
        </div>

        {/* Editorial Content: Negative Space & Clean Typographic Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-28">
          <div className="md:col-span-5">
            <p className="text-xl md:text-2xl font-light text-zinc-200 leading-relaxed">
              AWS Community Day Udaipur 2026 brings global cloud architecture, frontier AI research, and high-throughput systems to the royal heritage of Mewar.
            </p>
          </div>
          <div className="md:col-span-7 flex flex-col gap-6 text-base font-light text-zinc-400 leading-relaxed">
            <p>
              Organized by the AWS User Group Udaipur, this is not an ordinary symposium. It is an editorial convergence where independent builders, principal architects, and engineering pioneers dissect real-world production challenges.
            </p>
            <p>
              From custom AWS Graviton silicon and hyper-scale Bedrock clusters to zero-latency serverless topologies, we explore how cloud primitives are fundamentally redefining autonomous computing in 2026 and beyond.
            </p>
          </div>
        </div>

        {/* Pillar Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-white/10">
          {eventData.stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-medium text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-sans font-normal text-zinc-400 tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
