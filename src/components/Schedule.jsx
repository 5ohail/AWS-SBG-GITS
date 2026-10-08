import React, { useState } from 'react';
import { scheduleData } from '../data/schedule';
import { Clock, MapPin, ChevronRight } from 'lucide-react';

export default function Schedule() {
  const [activeSession, setActiveSession] = useState(null);

  return (
    <section
      id="schedule"
      className="relative w-full py-32 bg-[#030303] text-white border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-mono font-medium text-zinc-400">06</span>
              <div className="w-12 h-[1px] bg-white/20" />
              <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
                AGENDA & FLOW
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light font-display text-white tracking-tight">
              OCTOBER 31 2026
            </h2>
          </div>

          <div className="text-sm font-mono text-zinc-400">
            ALL TIMES IST (UTC+05:30) • 3 CONCURRENT TRACKS
          </div>
        </div>

        {/* Editorial Timeline (Typography & Spacing, No Cards) */}
        <div className="flex flex-col border-t border-white/10">
          {scheduleData.map((item, index) => {
            const isExpanded = activeSession === index;
            return (
              <div
                key={index}
                onMouseEnter={() => setActiveSession(index)}
                onClick={() => setActiveSession(isExpanded ? null : index)}
                className={`py-8 md:py-10 border-b border-white/10 transition-all duration-300 cursor-pointer group ${isExpanded ? 'schedule-row-expanded bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                  }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">

                  {/* Time & Slot */}
                  <div className="md:col-span-3 flex flex-col">
                    <span className="text-lg md:text-xl font-mono text-zinc-300 font-light group-hover:text-white transition-colors">
                      {item.time}
                    </span>
                    <span className="text-xs font-mono tracking-wider text-[#FF9900] uppercase mt-1">
                      {item.slot}
                    </span>
                  </div>

                  {/* Title & Track */}
                  <div className="md:col-span-7">
                    <h3 className="text-xl md:text-2xl font-display font-light text-zinc-100 group-hover:text-white transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs md:text-sm text-zinc-400 font-light">
                      <span>{item.speaker}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9900]" />
                        {item.track}
                      </span>
                    </div>

                    {/* Interactive Reveal Description */}
                    {isExpanded && (
                      <p className="mt-4 text-sm font-light text-zinc-300 leading-relaxed max-w-2xl animate-fade-in">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Right: Expand arrow */}
                  <div className="md:col-span-2 flex justify-start md:justify-end items-center">
                    <div
                      className={`schedule-chevron w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 ${isExpanded
                        ? 'border-[#FF9900] bg-[#FF9900]/10 text-[#FF9900] rotate-90'
                        : 'text-zinc-500 group-hover:text-white group-hover:border-white/30'
                        }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
