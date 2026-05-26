import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = (props) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-gray-800 group-[.toaster]:text-gray-900 group-[.toaster]:dark:text-gray-100 group-[.toaster]:border-gray-200 group-[.toaster]:dark:border-gray-700",
          description:
            "group-[.toast]:text-gray-500 group-[.toast]:dark:text-gray-400",
          actionButton:
            "group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50 dark:group-[.toast]:bg-gray-50 dark:group-[.toast]:text-gray-900",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 dark:group-[.toast]:bg-gray-700 dark:group-[.toast]:text-gray-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
