import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

// Modules that explicitly contain long data lists or log tables
const LOG_MODULES = [
  'raw-material',
  'pulp-mill',
  'machine',
  'rewinder',
  'pending-order',
  'dispatch',
  'store',
  'reports'
];

export const ScrollToTopButton = ({ activeModule }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Only render on pages that have log lists or long data tables
  if (!LOG_MODULES.includes(activeModule)) {
    return null;
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 lg:bottom-8 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#cf8730] text-white font-bold text-xs shadow-2xl hover:shadow-[#cf8730]/40 hover:scale-105 transition-all animate-in fade-in"
      title="Scroll Up to Top of Log List"
    >
      <ArrowUp className="w-4 h-4 animate-bounce" />
      <span>Scroll Up</span>
    </button>
  );
};
