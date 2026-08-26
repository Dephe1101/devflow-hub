import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '— Chọn —',
  disabled = false,
}: CustomSelectProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(optValue);
      setIsOpen(false);
    },
    [onChange],
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 text-sm
          bg-gray-800 border rounded-lg transition-all cursor-pointer
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-600 hover:border-gray-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className={selectedOption ? 'text-gray-100' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500 text-center">Không có dữ liệu</div>
          ) : (
            <ul className="max-h-40 overflow-y-auto py-1">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelect(opt.value);
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-sm transition-colors
                      ${
                        opt.value === value
                          ? 'bg-blue-600/20 text-blue-400 font-medium'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
