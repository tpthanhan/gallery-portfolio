"use client";

import type { FC } from "react";
import { Button as HeroButton } from "@heroui/react";

import type { ButtonProps } from "./ButtonProps";

export const Button: FC<ButtonProps> = ({
  className = "",
  variant = "ghost",
  ...props
}) => (
  <HeroButton
    variant={variant}
    className={`still-button ${className}`}
    {...props}
  />
);
