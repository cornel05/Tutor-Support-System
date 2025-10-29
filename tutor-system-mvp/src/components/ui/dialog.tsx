import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

export type DialogProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  return (
    <Transition show={open} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <HeadlessDialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-6 text-left align-middle shadow-2xl">
                <HeadlessDialog.Title as="h3" className="text-lg font-semibold text-white">
                  {title}
                </HeadlessDialog.Title>
                {description ? (
                  <HeadlessDialog.Description className="mt-1 text-sm text-slate-400">
                    {description}
                  </HeadlessDialog.Description>
                ) : null}
                <div className="mt-4 space-y-4 text-slate-200">{children}</div>
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
