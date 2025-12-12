'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Button from '../common/Button';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isGuest?: boolean;
}

export default function LogoutConfirmation({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  isGuest = false
}: LogoutConfirmationProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-black dark:bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title 
                  as="h3" 
                  className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  {isGuest ? 'Exit Guest Mode' : 'Confirm Logout'}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    {isGuest 
                      ? 'Are you sure you want to exit guest mode? You will be returned to the home screen and can choose which mode to use next time.'
                      : 'Are you sure you want to log out? You will need to sign in again to access your account.'}
                  </p>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={onConfirm} 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : (isGuest ? 'Exit Guest Mode' : 'Log Out')}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 