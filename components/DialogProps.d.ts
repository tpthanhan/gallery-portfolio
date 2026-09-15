import type { ReactNode } from "react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}
