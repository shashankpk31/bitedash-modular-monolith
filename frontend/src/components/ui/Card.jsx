import React from 'react';
import { UI_CONFIG } from '../../config/constants';

export const Card = ({ children, title, subtitle, extra, className = "" }) => (
  <div className={`${UI_CONFIG.CARD_STYLE} ${className}`}>
    {(title || extra) && (
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
        <div>
          {title && <h3 className="font-bold text-gray-800 text-lg">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400 font-medium">{subtitle}</p>}
        </div>
        {extra && <div>{extra}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);