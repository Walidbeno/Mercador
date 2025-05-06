import React, { useState } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <div 
        className="flex items-center border border-gray-300 rounded-md overflow-hidden"
        onClick={() => setShowPicker(!showPicker)}
      >
        <div 
          className="w-10 h-8" 
          style={{ backgroundColor: color }}
        />
        <input 
          type="text" 
          value={color} 
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 border-l border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      {showPicker && (
        <div className="absolute mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg p-2">
          <input 
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}; 