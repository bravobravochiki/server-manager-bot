import React from 'react';
import { Plus } from 'lucide-react';
import { ServerPurchaseModal } from './ServerPurchaseModal';

export function NewServerButton() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-dark-primary hover:bg-opacity-90 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background transition-all duration-200 mb-4"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Server
      </button>

      {showModal && <ServerPurchaseModal onClose={() => setShowModal(false)} />}
    </>
  );
}