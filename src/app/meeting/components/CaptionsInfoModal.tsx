"use client";

interface CaptionsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CaptionsInfoModal({ isOpen, onClose }: CaptionsInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Captions</h2>
        
        <p className="text-gray-600 mb-4">
          Captions will appear here when available. Make sure captions are enabled in your 100ms room settings.
        </p>
        
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

