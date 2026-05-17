import { X } from 'lucide-react';
import { useState } from 'react';

export default function AdBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-accent/10 to-primary/10 border-b border-light-gray">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-dark-gray">
            🚀 Upgrade to Premium
          </p>
          <p className="text-xs text-gray-600">
            Get full macros, future menus, and ad free experience!
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <button className="btn-primary btn-small whitespace-nowrap">
            Upgrade Now
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/50 rounded transition-colors"
          >
            <X className="w-4 h-4 text-dark-gray" />
          </button>
        </div>
      </div>
    </div>
  );
}