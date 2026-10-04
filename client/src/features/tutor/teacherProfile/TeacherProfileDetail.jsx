import React from 'react';

export function Detail({ label, children }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p>{children}</p>
    </div>
  );
}
