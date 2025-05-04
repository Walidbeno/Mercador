import React, { createContext, useContext, ReactNode } from 'react';

// Define the shape of the theme context
interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  primaryColor: '#4f46e5', // Default Indigo 600 (from Tailwind)
  secondaryColor: '#3730a3', // Default Indigo 800 (from Tailwind)
});

// Props for the ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

// Provider component to wrap around components that need theme access
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme = {}
}) => {
  // Extract theme values with defaults
  const { 
    primaryColor = '#4f46e5', 
    secondaryColor = '#3730a3' 
  } = theme;

  // Create the value object to be provided
  const themeValue: ThemeContextType = {
    primaryColor,
    secondaryColor,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 