"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast as sonnerToast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

// Define a properly typed toast function
type ToastOptions = {
  title?: string;
  description?: string;
  [key: string]: any;
};

// Create a wrapper function with proper typing
const toast = (options: ToastOptions | string) => {
  if (typeof options === 'string') {
    return sonnerToast(options);
  }

  const { title, description, ...rest } = options;
  if (title && description) {
    return sonnerToast(title, { description, ...rest });
  } else if (title) {
    return sonnerToast(title, rest);
  }

  return sonnerToast('Notification');
};

// Add the variant methods from the original toast
toast.success = sonnerToast.success;
toast.error = sonnerToast.error;
toast.info = sonnerToast.info;
toast.warning = sonnerToast.warning;
toast.loading = sonnerToast.loading;
toast.message = sonnerToast.message;
toast.promise = sonnerToast.promise;
toast.dismiss = sonnerToast.dismiss;
toast.custom = sonnerToast.custom;

export { Toaster, toast }
