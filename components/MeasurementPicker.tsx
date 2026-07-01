import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface MeasurementPickerProps {
  units: { label: string; value: string }[];
  defaultUnit: string;
  min: number;
  max: number;
  defaultValue?: number;
  onChange: (val: number, unit: string) => void;
  lang: Language;
}

const MeasurementPicker: React.FC<MeasurementPickerProps> = ({
  units,
  defaultUnit,
  min,
  max,
  defaultValue,
  onChange,
  lang,
}) => {
  const [unit, setUnit] = useState(defaultUnit);
  const [value, setValue] = useState(() => {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    const currentMin = defaultUnit === 'ft'
      ? 4.0
      : (defaultUnit === 'lbs' ? Math.round(min * 2.20462) : min);
    const currentMax = defaultUnit === 'ft'
      ? 7.2
      : (defaultUnit === 'lbs' ? Math.round(max * 2.20462) : max);
    const mid = (currentMin + currentMax) / 2;
    return defaultUnit === 'ft' ? Number(mid.toFixed(1)) : Math.floor(mid);
  });

  useEffect(() => {
    onChange(value, unit);
  }, [value, unit, onChange]);

  const isFeet = unit === 'ft';
  const isLbs = unit === 'lbs';

  const handleUnitSwitch = (newUnit: string) => {
    if (newUnit === unit) return;

    let newValue = value;
    if (unit === 'cm' && newUnit === 'ft') {
      newValue = Number((value / 30.48).toFixed(1));
    } else if (unit === 'ft' && newUnit === 'cm') {
      newValue = Math.round(value * 30.48);
    } else if (unit === 'kg' && newUnit === 'lbs') {
      newValue = Math.round(value * 2.20462);
    } else if (unit === 'lbs' && newUnit === 'kg') {
      newValue = Math.round(value / 2.20462);
    }
    setUnit(newUnit);
    setValue(newValue);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Unit Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          {units.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => handleUnitSwitch(u.value)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition-all ${unit === u.value ? 'bg-brand-lime text-brand-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Value Picker / Slider */}
      <div className="flex flex-col items-center text-center w-full" dir="ltr">
        <div className="flex items-baseline justify-center gap-2 h-[96px] my-[14px]">
          <span className="text-6xl font-black tabular-nums leading-none">
            {value}
          </span>
          <span className="opacity-55 text-[18px] font-medium text-gray-400 uppercase">
            {unit}
          </span>
        </div>

        <input
          type="range"
          min={isFeet ? 4.0 : (isLbs ? Math.round(min * 2.20462) : min)}
          max={isFeet ? 7.2 : (isLbs ? Math.round(max * 2.20462) : max)}
          step={isFeet ? 0.1 : 1}
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          className="w-full max-w-[280px] bg-transparent rounded-lg appearance-none cursor-pointer mt-4"
        />
      </div>
    </div>
  );
};

export default MeasurementPicker;
