import React, { createContext, useContext, useState } from 'react';
import Modal from '../components/Modal'; // Adjust path to your Modal component

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  onConfirm: () => Promise<void> | void;
}

interface ModalContextType {
  openModal: (modalProps: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openModal = ({
    title,
    message,
    confirmText,
    cancelText,
    confirmButtonClass,
    cancelButtonClass,
    onConfirm,
  }: Omit<ModalState, 'isOpen'>) => {
    setModalState({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass,
      cancelButtonClass,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        confirmButtonClass={modalState.confirmButtonClass}
        cancelButtonClass={modalState.cancelButtonClass}
      />
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};