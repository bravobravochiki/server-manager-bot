import React from 'react';
import { AlertTriangle, Power } from 'lucide-react';

interface StopAllServersModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  serverCount: number;
}

export function StopAllServersModal({ onClose, onConfirm, serverCount }: StopAllServersModalProps) {
  const [confirmText, setConfirmText] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handleConfirm = async () => {
    if (confirmText !== 'CONFIRM') return;
    
    setIsProcessing(true);
    await onConfirm();
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px] max-w-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              Stop All Servers
            </h3>
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                You are about to stop <strong>{serverCount}</strong> running servers. This action:
              </p>
              <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
                <li>Will shut down all running servers</li>
                <li>May disrupt active services and connections</li>
                <li>Cannot be undone automatically</li>
              </ul>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Type CONFIRM to proceed:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  placeholder="CONFIRM"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmText !== 'CONFIRM' || isProcessing}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                Stop All Servers
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}