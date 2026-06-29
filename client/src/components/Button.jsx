import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  loading = false,
  ...props
}) => {
  const baseStyles = 'font-bold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#5624d0] text-white hover:bg-[#401b9c] border border-[#5624d0] hover:border-[#401b9c]',
    secondary: 'bg-white text-[#1c1d1f] border border-[#1c1d1f] hover:bg-[#f7f9fa]',
    danger: 'bg-white text-[#c40000] border border-[#c40000] hover:bg-red-50',
    outline: 'bg-transparent text-[#5624d0] border border-[#5624d0] hover:bg-purple-50',
    ghost: 'bg-transparent text-[#1c1d1f] border border-transparent hover:bg-black/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base w-full',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
