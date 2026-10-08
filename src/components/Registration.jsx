import React from 'react';
import { eventData } from '../data/event';
import MagneticButton from './MagneticButton';
import { ArrowUpRight, CheckCircle2, Ticket } from 'lucide-react';

export default function Registration() {
  const tiers = [
    {
      name: "BUILDER PASS",
      type: "Professional / General",
      description: "Full access to keynotes, 3 technical tracks, sponsor hall, official swag kit, Mewari lunch, and high-tea.",
      status: "SELLING FAST"
    },
    {
      name: "SCHOLAR PASS",
      type: "Students & Academia",
      description: "Subsidized pass for enrolled students. Valid academic institution ID required at badge pickup.",
      status: "LIMITED SEATS"
    },
    {
      name: "WORKSHOP LAB PASS",
      type: "All-Inclusive + Labs",
      description: "Includes access to the interactive hands-on coding labs, AWS credits, and mentor pairing.",
      status: "SPECIAL ACCESS"
    }
  ];

  return (
    <section
      id="register"
      className="relative w-full py-36 bg-[#030303] text-white border-t border-white/5 overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FF9900]/[0.05] blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Section Index */}
        <div className="flex items-center gap-4 mb-16">
          <span className="text-xs font-mono font-medium text-zinc-400">10</span>
          <div className="w-12 h-[1px] bg-white/20" />
          <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
            RESERVE YOUR PASS
          </span>
        </div>

        {/* Huge Minimalist CTA Headline */}
        <div className="max-w-5xl mb-20 font-display">
          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white leading-[0.95] tracking-tight">
            READY TO
          </h2>
          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-zinc-300 leading-[0.95] tracking-tight">
            JOIN THE
          </h2>
          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gradient-gold leading-[0.95] tracking-tight">
            COMMUNITY?
          </h2>
        </div>

        {/* Ticket Tier Previews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className="registration-tier-card p-8 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between hover:border-[#FF9900]/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono tracking-widest text-[#FF9900] uppercase">
                    {tier.name}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/10 text-zinc-400">
                    {tier.status}
                  </span>
                </div>
                <h3 className="text-xl font-display font-medium text-white mb-2">
                  {tier.type}
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-400">
                <Ticket className="w-4 h-4 text-[#FF9900]" />
                <span>Available via KonfHub</span>
              </div>
            </div>
          ))}
        </div>

        {/* The Giant Magnetic KonfHub Registration CTA Button */}
        <div className="registration-cta-card flex flex-col sm:flex-row items-center justify-between p-10 md:p-14 rounded-3xl border border-white/15 bg-gradient-to-r from-white/[0.04] to-[#FF9900]/[0.08] backdrop-blur-xl gap-8 shadow-2xl">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase block mb-2">
              HOSTED EXCLUSIVELY ON KONFHUB
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-white">
              Limited capacity of 1,200 attendees.
            </h3>
            <p className="text-sm font-light text-zinc-400 mt-2">
              Badge collection begins 08:30 AM at Geetanjali Institute of Technical Studies.
            </p>
          </div>

          <div className="shrink-0">
            <MagneticButton
              href={eventData.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full  bg-orange text-black hover:bg-[#FF9900] hover:text-black text-sm md:text-base font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_0_35px_rgba(255,255,255,0.2)] hover:shadow-[0_0_45px_rgba(255,153,0,0.6)] flex items-center gap-3 group"
            >
              <span>REGISTER ON KONFHUB</span>
              <ArrowUpRight className="w-5 h-5 text-black  group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </MagneticButton>
          </div>
        </div>

      </div>
    </section>
  );
}
