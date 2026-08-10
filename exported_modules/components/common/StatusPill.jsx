import React from 'react';

export const StatusPill = ({ type = 'success', text }) => {
  const styles = {
    success: 'bg-[#E7F9EF] text-[#16A34A] border border-[#16A34A]/25 dark:bg-[#1FCB79]/15 dark:text-[#1FCB79] dark:border-[#1FCB79]/30 font-bold',
    danger: 'bg-[#FDECEA] text-[#DC2626] border border-[#DC2626]/25 dark:bg-[#F1533C]/15 dark:text-[#F1533C] dark:border-[#F1533C]/30 font-bold',
    warning: 'bg-[#FEF3E1] text-[#D97706] border border-[#D97706]/25 dark:bg-[#F5A623]/15 dark:text-[#F5A623] dark:border-[#F5A623]/30 font-bold',
    info: 'bg-[#EAEEFF] text-[#2563EB] border border-[#2563EB]/25 dark:bg-[#4C6FFF]/15 dark:text-[#4C6FFF] dark:border-[#4C6FFF]/30 font-bold',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-[#1C2237] dark:text-slate-300 dark:border-[#262D4A] font-bold'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${styles[type] || styles.neutral}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-90" />
      {text}
    </span>
  );
};
