"use client";
import React from "react";
import clsx from "clsx";

type ActionButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "edit" | "delete";
  disabled?: boolean;
};

export default function ActionButton({
  label,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}: ActionButtonProps) {
  const baseClass =
    "px-4 py-2 rounded text-white transition-colors duration-200 focus:outline-none focus:ring focus:ring-offset-2 focus:ring-blue-500";

  const variantClass = clsx({
    "bg-blue-600 hover:bg-blue-700": variant === "primary" && !disabled,
    "bg-gray-600 hover:bg-gray-700": variant === "secondary" && !disabled,
    "bg-yellow-600 hover:bg-yellow-700": variant === "edit" && !disabled,
    "bg-red-600 hover:bg-red-700": variant === "delete" && !disabled,
    "bg-blue-400 cursor-not-allowed opacity-50":
      variant === "primary" && disabled,
    "bg-gray-400 cursor-not-allowed opacity-50":
      variant === "secondary" && disabled,
    "bg-yellow-400 cursor-not-allowed opacity-50":
      variant === "edit" && disabled,
    "bg-red-400 cursor-not-allowed opacity-50":
      variant === "delete" && disabled,
  });

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseClass, variantClass)}
    >
      {label}
    </button>
  );
}
