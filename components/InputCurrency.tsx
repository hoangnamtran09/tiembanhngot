import React, { useState, useEffect } from 'react';
import { parseFormattedNumber, formatNumber } from '../utils/format';

interface InputCurrencyProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Input component với auto-format số tiền VND
 * Hiển thị với dấu phẩy, nhưng value là number
 */
const InputCurrency: React.FC<InputCurrencyProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  // Update display when value changes externally
  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatNumber(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-digit characters
    const cleaned = inputValue.replace(/\D/g, '');
    
    if (cleaned === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Parse to number
    const numValue = parseInt(cleaned, 10);
    
    // Format for display
    const formatted = formatNumber(numValue);
    setDisplayValue(formatted);
    
    // Call onChange with numeric value
    onChange(numValue);
  };

  const handleBlur = () => {
    // Ensure display is formatted on blur
    if (value > 0) {
      setDisplayValue(formatNumber(value));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for easy editing
    e.target.select();
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`${className} pr-8`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
        đ
      </span>
    </div>
  );
};

export default InputCurrency;

