import React from 'react';
import { eventData } from '../data/event';
import { ArrowUp, Heart } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="w-full border-t border-white/5 pt-24 pb-12 transition-colors duration-500"
      style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--footer-text)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Top Grid: Branding, Nav, Socials */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-20 border-b border-white/5">

          {/* Col 1: Brand Info */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-extrabold text-2xl font-display text-white tracking-tighter">
                  aws
                </span>
                <span className="text-sm font-light text-zinc-400 lowercase">
                  community day
                </span>
                <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider ml-1">
                  UDAIPUR '26
                </span>
              </div>
              <p className="text-sm font-light text-zinc-500 max-w-sm leading-relaxed mb-6">
                Where Cloud Meets Community. A non-profit, volunteer-driven conference uniting builders, researchers, and students.
              </p>
            </div>

            <div className="text-xs font-mono text-zinc-400">
              Udaipur, Rajasthan, India • OCT 31 2026
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase mb-2">
              NAVIGATION
            </span>
            <a href="#home" className="text-sm text-zinc-400 hover:text-white transition-colors">Home</a>
            <a href="#about" className="text-sm text-zinc-400 hover:text-white transition-colors">About</a>
            <a href="#speakers" className="text-sm text-zinc-400 hover:text-white transition-colors">Speakers</a>
            <a href="#schedule" className="text-sm text-zinc-400 hover:text-white transition-colors">Schedule</a>
            <a href="#venue" className="text-sm text-zinc-400 hover:text-white transition-colors">Venue & Travel</a>
            <a href="#sponsors" className="text-sm text-zinc-400 hover:text-white transition-colors">Sponsors</a>
            <a href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Col 3: Social & Community */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase mb-2">
                CONNECT & COLLABORATE
              </span>
              <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                <a
                  href={eventData.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Twitter (X)
                </a>
                <span>•</span>
                <a
                  href={eventData.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
                <span>•</span>
                <a
                  href={eventData.socials.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Discord
                </a>
                <span>•</span>
                <a
                  href={eventData.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>

            {/* Back to top button */}
            <div className="mt-8">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#FF9900] tracking-wider uppercase transition-colors cursor-pointer group"
              >
                <span>BACK TO TOP</span>
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-light text-zinc-600">
          <p>
            © 2026 AWS User Group Udaipur. Amazon Web Services, AWS, and the AWS logo are trademarks of Amazon.com, Inc. or its affiliates.
          </p>
          <p className="flex items-center gap-1.5 text-zinc-500">
            Crafted with passion for cloud builders in Udaipur
          </p>
        </div>

      </div>
    </footer>
  );
}
