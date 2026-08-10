import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const VARIANT_STYLES = {
  hero: {
    bg: 'bg-[#cf8730]',
    shadow: 'shadow-[#cf8730]/20',
    iconColor: 'text-[#d97706]', // Rich Amber
  },
  indigo: {
    bg: 'bg-[#cf8730]',
    shadow: 'shadow-[#cf8730]/20',
    iconColor: 'text-[#d97706]', // Rich Amber
  },
  emerald: {
    bg: 'bg-[#cf8730]',
    shadow: 'shadow-[#cf8730]/20',
    iconColor: 'text-[#059669]', // Vibrant Emerald Green
  },
  violet: {
    bg: 'bg-[#cf8730]',
    shadow: 'shadow-[#cf8730]/20',
    iconColor: 'text-[#7c3aed]', // Vibrant Deep Violet
  },
  amber: {
    bg: 'bg-[#cf8730]',
    shadow: 'shadow-[#cf8730]/20',
    iconColor: 'text-[#059669]', // Vibrant Emerald Green
  },
  blue: {
    bg: 'bg-[#cf8730]',
    shadow: 'shadow-[#cf8730]/20',
    iconColor: 'text-[#0284c7]', // Vibrant Sky Blue
  }
};

const useCountUp = (targetValStr) => {
  const [displayVal, setDisplayVal] = useState(targetValStr);

  useEffect(() => {
    if (!targetValStr) return;
    const str = String(targetValStr);
    const numMatch = str.match(/([0-9,.]+)/);
    if (!numMatch) {
      setDisplayVal(targetValStr);
      return;
    }

    const rawNumStr = numMatch[1].replace(/,/g, '');
    const targetNum = parseFloat(rawNumStr);
    if (isNaN(targetNum)) {
      setDisplayVal(targetValStr);
      return;
    }

    const prefix = str.slice(0, numMatch.index);
    const suffix = str.slice(numMatch.index + numMatch[1].length);
    const hasDecimal = rawNumStr.includes('.');
    const decimalPlaces = hasDecimal ? (rawNumStr.split('.')[1] || '').length : 0;

    let start = 0;
    const duration = 700; // ms
    const startTime = performance.now();

    let animationFrame;
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic easing
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = start + (targetNum - start) * easeProgress;

      const formattedNum = currentNum.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      });

      setDisplayVal(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValStr]);

  return displayVal;
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'indigo',
  trend,
  trendType = 'up',
  isExpanded = false
}) => {
  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.indigo;
  const animatedValue = useCountUp(value);

  return (
    <div className={`relative overflow-hidden rounded-2xl text-white ${style.bg} shadow-lg ${style.shadow} transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu will-change-[width,height,transform] hover:shadow-xl hover:-translate-y-1 group w-full min-w-0 flex flex-col justify-between ${
      isExpanded 
        ? 'p-6 sm:p-7 min-h-[160px] scale-[1.02] shadow-2xl ring-1 ring-white/25' 
        : 'p-4 sm:p-5 min-h-[135px] scale-100'
    }`}>

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-1 mb-2 min-w-0">
        <span className={`font-bold uppercase tracking-tight sm:tracking-wide text-white/90 leading-tight pr-1 block transition-all duration-300 ${
          isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
        }`}>{title}</span>
        {Icon && (
          <div className={`stat-card-badge rounded-xl bg-white/20 border-0 border-none backdrop-blur-md shrink-0 shadow-2xs group-hover:scale-110 transition-all duration-300 ${
            isExpanded ? 'p-2.5 sm:p-3' : 'p-2 sm:p-2.5'
          }`}>
            <Icon className={`text-white drop-shadow-2xs transition-all duration-300 ${
              isExpanded ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4 sm:w-5 sm:h-5'
            }`} />
          </div>
        )}
      </div>

      {/* Metric Value & Trend Badge */}
      <div className="flex flex-wrap items-baseline justify-between gap-y-1 gap-x-2 my-1">
        <div className={`font-black tracking-tight text-white drop-shadow-xs whitespace-nowrap transition-all duration-300 ${
          isExpanded ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl lg:text-3xl'
        }`}>{animatedValue}</div>
        {trend && (
          <div className={`flex items-center font-extrabold rounded-lg bg-white/20 backdrop-blur-md text-white shadow-xs shrink-0 whitespace-nowrap transition-all duration-300 ${
            isExpanded ? 'text-xs px-2.5 py-1' : 'text-[10px] sm:text-[11px] px-2 py-0.5'
          }`}>
            {trendType === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        )}
      </div>

      {/* Subtitle / Details */}
      {subtitle && <p className={`text-white/85 font-medium truncate block transition-all duration-300 ${
        isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
      }`}>{subtitle}</p>}
    </div>
  );
};
