import React from 'react';
import { sponsorsData } from '../data/sponsors';
import { ArrowUpRight } from 'lucide-react';

export default function Sponsors() {
  return (
    <section
      id="sponsors"
      className="relative w-full py-32 bg-[#030303] text-white border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-mono font-medium text-zinc-400">08</span>
              <div className="w-12 h-[1px] bg-white/20" />
              <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
                PARTNERS & ECOSYSTEM
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light font-display text-white tracking-tight">
              SUPPORTED BY LEADERS
            </h2>
          </div>

          <a
            href="mailto:sponsors@awsudaipur.org?subject=AWS%20Community%20Day%20Udaipur%202026%20Sponsorship"
            className="text-xs font-mono text-zinc-400 hover:text-[#FF9900] tracking-wider uppercase flex items-center gap-2 group transition-colors"
          >
            <span>BECOME A SPONSOR</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Sponsors Tiers Layout */}
        <div className="flex flex-col gap-20">
          {sponsorsData.map((tierGroup, idx) => (
            <div key={idx} className="flex flex-col gap-8">
              
              {/* Tier Label */}
              <div className="text-xs font-mono tracking-[0.25em] text-zinc-400 uppercase">
                {tierGroup.tier}
              </div>

              {/* Minimal Monochrome Brand Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tierGroup.sponsors.map((sp, sIdx) => (
                  <a
                    key={sIdx}
                    href={sp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sponsor-card-box p-8 rounded-xl border border-white/5 hover:border-[#FF9900]/40 bg-white/[0.015] hover:bg-[#FF9900]/[0.02] transition-all duration-300 group flex flex-col justify-between h-40"
                  >
                    <div className="flex items-center justify-between">
                      {/* Clean Monochrome Name */}
                      <span className="text-xl md:text-2xl font-display font-medium text-zinc-300 group-hover:text-white group-hover:text-[#FFAE42] transition-colors">
                        {sp.name}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-[#FF9900] transition-colors" />
                    </div>

                    <div>
                      <div className="text-xs text-zinc-400 font-light">
                        {sp.tagline}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mt-1">
                        {sp.category}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
