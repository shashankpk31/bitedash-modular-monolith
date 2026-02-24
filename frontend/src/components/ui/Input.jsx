import React from 'react';

function Input({ label, type = "text", placeholder, value, onChange, name, required = false }) {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white/50 backdrop-blur-sm"
      />
    </div>
  );
}

export default Input;