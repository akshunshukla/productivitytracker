import { SessionProvider } from "@/context/SessionContext";
import DashboardLayout from "@/components/DashboardLayout";
import Goals from "@/components/Goals";
import TodayTasks from "@/components/TodayTasks";
import SessionTimer from "@/components/SessionTimer";
import MotivationalQuote from "@/components/MotivationalQuote";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <SessionProvider>
        {" "}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SessionTimer />
            <TodayTasks />
          </div>
          <div className="space-y-8">
            <Goals />
            <MotivationalQuote />
          </div>
        </div>
      </SessionProvider>
    </DashboardLayout>
  );
};

export default Dashboard;
