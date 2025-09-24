/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import React, { Fragment, useRef } from 'react';
import { Button } from 'antd';
import { cn } from '../../utils/cn';

type IconFunction = (defaultIconClassNames: string) => React.ReactNode;

export interface ConfirmButtonProps {
  title: string;
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface ConfirmModalProps {
  mode?: 'info' | 'danger' | 'success';
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  cancel?: ConfirmButtonProps;
  confirm: ConfirmButtonProps;
  icon?: string | IconFunction;
  className?: string;
  'data-testid'?: string;
}

/**
 * Z-Index Hierarchy: z-[150] - Higher than standard modals for confirmation dialogs
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen = false,
  confirm,
  cancel,
  icon,
  mode = 'info',
  onClose,
  subTitle,
  title,
  className,
  'data-testid': dataTestId,
}) => {
  const refDialog = useRef<HTMLDivElement>(null);

  const finalIcon = (() => {
    if (icon) {
      const defaultIconClassNames = cn(
        'w-12 h-12 sm:w-16 sm:h-16',
        mode === 'info' && 'text-primary',
        mode === 'danger' && 'text-destructive',
        mode === 'success' && 'text-green-600'
      );
      if (typeof icon === 'string') {
        // For custom icon paths, we would need an Icon component
        // For now, fallback to mode-based icons
        return getDefaultIcon();
      }
      return icon(defaultIconClassNames);
    }
    return getDefaultIcon();
  })();

  function getDefaultIcon() {
    switch (mode) {
      case 'info':
        return <Info className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />;
      case 'danger':
        return <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />;
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        initialFocus={refDialog}
        as="div"
        className="fixed inset-0 z-[150] overflow-y-auto"
        onClose={onClose}
        data-testid={dataTestId}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" />
        </Transition.Child>

        <Dialog.Panel className="min-h-screen px-2 sm:px-4 text-center flex items-center justify-center">
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div
              className={cn(
                "inline-block w-full max-w-sm sm:max-w-md overflow-hidden text-left align-middle transition-all transform",
                "bg-card border border-border rounded-lg shadow-2xl mx-auto my-4 sm:my-8",
                className
              )}
            >
              <div className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-4 bg-card">
                <div ref={refDialog} className="sm:flex sm:items-start gap-4">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center mb-4 sm:mb-0 sm:mx-0">
                    {finalIcon}
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <Dialog.Title
                      as="h3"
                      className="text-lg sm:text-xl font-semibold leading-6 text-card-foreground"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      {typeof subTitle === 'string' ? (
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {subTitle}
                        </p>
                      ) : (
                        subTitle
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-muted/30 border-t border-border">
                {cancel && (
                  <Button
                    type={cancel.type || 'default'}
                    danger={cancel.danger}
                    loading={cancel.loading}
                    disabled={cancel.disabled}
                    onClick={cancel.onClick}
                    className="w-full sm:w-auto"
                  >
                    {cancel.title}
                  </Button>
                )}
                <Button
                  type={confirm.type || 'primary'}
                  danger={confirm.danger}
                  loading={confirm.loading}
                  disabled={confirm.disabled}
                  onClick={confirm.onClick}
                  className="w-full sm:w-auto"
                >
                  {confirm.title}
                </Button>
              </div>
            </div>
          </Transition.Child>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};