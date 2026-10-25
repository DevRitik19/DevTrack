import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  isDestructive = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {isDestructive && (
            <div className="p-2 rounded-lg bg-[#FDF2F0] border border-[#F3CECB] text-[#C24137] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <p className="text-sm text-text-secondary leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E3D5BD]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="devtrack-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={isDestructive ? 'devtrack-btn-danger' : 'devtrack-btn-primary'}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
