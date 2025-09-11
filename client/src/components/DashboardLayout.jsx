import Sidebar from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700 lg:justify-end">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
