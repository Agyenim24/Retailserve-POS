import { ArrowRightOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-[2.5rem] bg-surface-card border border-slate-200/50 dark:border-slate-800/50 p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md animate-in fade-in zoom-in duration-300">
          <div className="absolute right-6 top-6">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-400 hover:bg-surface-elevated hover:text-slate-500 dark:hover:text-slate-200 transition-all duration-300"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 mb-6">
              <ArrowRightOnRectangleIcon className="h-10 w-10 text-red-500" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Confirm Logout
              </h3>
              <div className="mt-3">
                <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Are you sure you want to end your current session? You will need to sign in again to access the system.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <button
              type="button"
              className="px-4 py-4 rounded-2xl bg-surface-elevated border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 font-bold transition-all hover:scale-[1.02] active:scale-95 text-center"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
