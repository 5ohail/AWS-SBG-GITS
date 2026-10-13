import React from 'react';
import { eventData } from '../../communityDayData';
import { MapPin, Navigation2, ArrowUpRight, Plane, Train } from 'lucide-react';

export default function Venue() {
  return (
    <section
      id="venue"
      className="relative w-full py-32 bg-[#050505] text-white border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Index */}
        <div className="flex items-center gap-4 mb-16">
          <span className="text-xs font-mono font-medium text-zinc-400">07</span>
          <div className="w-12 h-[1px] bg-white/20" />
          <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
            LOCATION & STORYTELLING
          </span>
        </div>

        {/* Large Editorial Headline */}
        <div className="max-w-4xl mb-16 font-display">
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white leading-[1.05] tracking-tight">
            UDAIPUR
          </h2>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-zinc-300 leading-[1.05] tracking-tight">
            THE CITY
          </h2>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gradient-gold leading-[1.05] tracking-tight">
            OF LAKES.
          </h2>
        </div>

        {/* Cinematic Imagery Canvas Banner */}
        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-16 border border-white/10 group">
          <img
            src="/assets/udaipur_palace.webp"
            alt="Udaipur City Palace and Lake Pichola at twilight"
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-black/20 to-transparent" />
          
          {/* Coordinates Tag */}
          <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300">
            {eventData.venue.coordinates}
          </div>

          {/* Subtitle inside banner */}
          <div className="absolute bottom-8 left-8 max-w-lg">
            <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase block mb-1">
              HISTORIC MEWAR MEETS DISTRIBUTED CLOUD
            </span>
            <p className="text-sm md:text-base font-light text-zinc-200">
              Surrounded by the ancient Aravalli mountains and reflective tranquil waters, Udaipur forms the serene backdrop for frontier technology.
            </p>
          </div>
        </div>

        {/* Minimalist Venue Logistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pt-8 border-t border-white/10">
          
          <div className="md:col-span-5">
            <h3 className="text-2xl md:text-3xl font-display font-light text-white mb-3">
              {eventData.venue.name}
            </h3>
            <p className="text-sm font-light text-zinc-400 leading-relaxed mb-6">
              {eventData.venue.address}
            </p>

            <a
              href={eventData.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#FF9900] hover:text-[#FFAE42] tracking-wider uppercase group"
            >
              <span>OPEN IN GOOGLE MAPS</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Airport Connectivity */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-[#FF9900] shrink-0">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">5 Mins from Airport</h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Maharana Pratap Airport (UDR) connects daily direct flights from Delhi, Mumbai, Bengaluru, and Jaipur.
                </p>
              </div>
            </div>

            {/* Railway Connectivity */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-[#FF9900] shrink-0">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Rail & Expressways</h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  25 mins from Udaipur City Railway Station. Smooth connectivity via NH-27 Golden Quadrilateral corridor.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
