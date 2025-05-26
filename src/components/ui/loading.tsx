"use client";

import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  size = "md",
  className,
  text,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (fullScreen) {
    return (
      <div className="loader">
        <div className="spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        {text && <div className="loader-text">{text}</div>}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("spinner", sizeClasses[size])}>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {text && <div className="mt-2 text-sm text-muted-foreground">{text}</div>}
    </div>
  );
}

interface ButtonSpinnerProps {
  className?: string;
}

export function ButtonSpinner({ className }: ButtonSpinnerProps) {
  return <span className={cn("btn-spinner", className)}></span>;
}

interface ContentLoaderProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export function ContentLoader({
  className,
  height = "h-4",
  width = "w-full",
  rounded = true,
}: ContentLoaderProps) {
  return (
    <div
      className={cn(
        "pulse-loading",
        height,
        width,
        rounded && "rounded",
        className
      )}
    ></div>
  );
}
