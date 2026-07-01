import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brand-lime text-brand-dark hover:bg-brand-limeHover shadow-[0_0_15px_rgb(var(--brand-lime)/0.3)]",
    secondary: "bg-brand-surface text-white border border-white/10 hover:border-brand-lime/50",
    outline: "bg-transparent border-2 border-brand-lime text-brand-lime hover:bg-brand-lime/10"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;