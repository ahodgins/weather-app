'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type TemperatureUnit = 'C' | 'F';

interface TemperatureContextType {
  unit: TemperatureUnit;
  toggleUnit: () => void;
  convertTemp: (celsius: number) => number;
}

const TemperatureContext = createContext<TemperatureContextType | undefined>(undefined);

export function TemperatureProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<TemperatureUnit>('C');

  const toggleUnit = () => {
    setUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  const convertTemp = (celsius: number): number => {
    if (unit === 'C') return celsius;
    return (celsius * 9/5) + 32;
  };

  return (
    <TemperatureContext.Provider value={{ unit, toggleUnit, convertTemp }}>
      {children}
    </TemperatureContext.Provider>
  );
}

export function useTemperature() {
  const context = useContext(TemperatureContext);
  if (context === undefined) {
    throw new Error('useTemperature must be used within a TemperatureProvider');
  }
  return context;
} 