import React from "react";

interface SelectInputProps<T> {
  label?: string;
  value: string;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function SelectInput<T>({
  label,
  value,
  options,
  getOptionValue,
  getOptionLabel,
  onChange,
  disabled = false,
  className = "",
  required = false,
}: SelectInputProps<T>) {
  return (
    <div className="w-full mb-2">
      {label && <label className="block text-white font-semibold mb-1 drop-shadow-lg">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={
          `${className} block w-full px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 text-base font-normal transition-all backdrop-blur-sm text-white`
        }
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.7) 0%, rgba(40, 30, 50, 0.6) 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(108, 43, 189, 0.15), 0 0 25px rgba(0, 140, 140, 0.1)'
        }}
      >
        <option value="" disabled>{label || "Bitte wählen"}</option>
        {options.map(option => (
          <option 
            key={getOptionValue(option)} 
            value={getOptionValue(option)}
            style={{
              background: 'rgba(20, 20, 40, 0.95)',
              color: 'white'
            }}
          >
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
