"use client";

import { useCallback, type FC } from "react";
import { Modal } from "@heroui/react";

import type { DialogProps } from "./DialogProps";

export const Dialog: FC<DialogProps> = ({
  isOpen,
  onClose,
  label,
  children,
  className = "",
}) => {
  const handleOpenChange = useCallback(
    (isNextOpen: boolean) => {
      if (!isNextOpen) onClose();
    },
    [onClose],
  );

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable
      variant="blur"
      className="still-modal-backdrop"
    >
      <Modal.Container
        placement="center"
        scroll="inside"
        className="still-modal-container"
      >
        <Modal.Dialog
          aria-label={label}
          className={`gallery-dialog ${className}`}
        >
          {children}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
