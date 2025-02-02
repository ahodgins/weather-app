'use client';

import { useTemperature } from '@/app/_contexts/temperature-context';

export function TemperatureToggle() {
  const { unit, toggleUnit } = useTemperature();

  return (
    <button
      onClick={toggleUnit}
      className="px-3 py-1 rounded-lg text-sm font-medium
                bg-gray-100 dark:bg-gray-800 
                text-gray-600 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-colors duration-200"
    >
      °{unit}
    </button>
  );
} 