import type { ButtonProps as HeroButtonProps } from "@heroui/react";

export interface ButtonProps extends Omit<HeroButtonProps, "className"> {
  className?: string;
}
