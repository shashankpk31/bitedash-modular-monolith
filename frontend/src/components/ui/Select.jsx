import React from 'react';

function Select({ label, value, onChange, name, required = false, children, disabled = false }) {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && (
        <label className="text-sm font-semibold text-gray-700 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white/50 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {children}
      </select>
    </div>
  );
}

export default Select;
