import { X } from 'lucide-react';

export function AuthErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <p className="font-medium">{message}</p>
        <button type="button" onClick={onDismiss} className="text-red-700 hover:text-red-900 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
