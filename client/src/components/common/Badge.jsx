import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variantStyles = {
    neutral: 'bg-[#EAE2D3] text-[#292C25] border-[#E3D5BD]',
    success: 'bg-[#EAF2E8] text-[#263524] border-[#BDD6B7]',
    warning: 'bg-[#FAF0E6] text-[#B65F3B] border-[#EED7C8]',
    info: 'bg-[#E7EFF3] text-[#2C5267] border-[#C7D9E4]',
    danger: 'bg-[#FDF2F0] text-[#C24137] border-[#F3CECB]',
    purple: 'bg-[#F1ECE6] text-[#6E4E37] border-[#DDD3C7]',
    terracotta: 'bg-[#FBF1EC] text-[#B65F3B] border-[#ECCDC1]',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
};
