import React, { useState } from 'react';
import { faqData } from '../data/faq';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="relative w-full py-32 bg-[#050505] text-white border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-16">
          <span className="text-xs font-mono font-medium text-zinc-400">09</span>
          <div className="w-12 h-[1px] bg-white/20" />
          <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
            ESSENTIAL DETAILS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Heading */}
          <div className="lg:col-span-5">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light font-display text-white tracking-tight mb-6">
              FREQUENTLY<br />ASKED<br />QUESTIONS
            </h2>
            <p className="text-sm font-light text-zinc-400 leading-relaxed max-w-md">
              Need assistance or curious about accommodations, travel recommendations, or diversity grants? Feel free to reach out to our organizing team.
            </p>
          </div>

          {/* Right Column: Minimal Accordion */}
          <div className="lg:col-span-7 flex flex-col border-t border-white/10">
            {faqData.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="faq-accordion-item border-b border-white/10 transition-colors"
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full py-6 md:py-8 flex items-center justify-between text-left group cursor-pointer"
                  >
                    <span className="text-lg md:text-xl font-display font-light text-zinc-200 group-hover:text-white transition-colors pr-6">
                      {item.question}
                    </span>
                    <div className="faq-icon-circle w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-[#FF9900] group-hover:border-[#FF9900]/40 transition-colors">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pb-8 text-sm md:text-base font-light text-zinc-400 leading-relaxed animate-fade-in pr-6">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
