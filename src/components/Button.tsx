import React, { ButtonHTMLAttributes } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  href,
  ...props
}) => {
  const { primaryColor, secondaryColor } = useTheme();

  // Convert hex colors to RGB for hover effects
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Create CSS variables for colors
  const primaryRgb = hexToRgb(primaryColor);
  const secondaryRgb = hexToRgb(secondaryColor);

  // Set default styles
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  const baseStyle = `
    font-medium rounded-lg transition-colors duration-200 
    ${sizeClasses[size]} 
    ${fullWidth ? 'w-full' : ''}
  `;

  // Dynamic styles based on theme
  const style: React.CSSProperties = {};
  
  if (variant === 'primary') {
    style.backgroundColor = primaryColor;
    style.color = 'white';
    style.border = 'none';
  } else if (variant === 'secondary') {
    style.backgroundColor = secondaryColor;
    style.color = 'white';
    style.border = 'none';
  } else if (variant === 'outline') {
    style.backgroundColor = 'transparent';
    style.color = primaryColor;
    style.border = `1px solid ${primaryColor}`;
  }

  // Handle hover effect with inline styles
  const hoverStyle = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (variant === 'primary' && primaryRgb) {
      e.currentTarget.style.backgroundColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)`;
    } else if (variant === 'secondary' && secondaryRgb) {
      e.currentTarget.style.backgroundColor = `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)`;
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = `rgba(${primaryRgb?.r}, ${primaryRgb?.g}, ${primaryRgb?.b}, 0.1)`;
    }
  };

  const resetStyle = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = primaryColor;
    } else if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = secondaryColor;
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  // Return link if href is provided, otherwise button
  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyle} inline-block text-center ${className}`}
        style={style}
        onMouseEnter={hoverStyle}
        onMouseLeave={resetStyle}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={`${baseStyle} ${className}`}
      style={style}
      onMouseEnter={hoverStyle}
      onMouseLeave={resetStyle}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 