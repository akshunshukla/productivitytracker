// client/src/pages/Analytics.jsx

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/api/axios";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formatMsToHours = (ms) => {
  if (!ms) return "0.0";
  return (ms / (1000 * 60 * 60)).toFixed(1);
};

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [summaryRes, dailyRes, tagsRes, streakRes] = await Promise.all([
          api.get("/analytics/weeklySummary"),
          api.get("/analytics/dailyBreakdown"),
          api.get("/analytics/tagWiseStats"),
          api.get("/analytics/streak"),
        ]);

        setSummary(summaryRes.data.data);
        setStreakData(streakRes.data.data);

        if (dailyRes.data.data) {
          const formattedDailyData = dailyRes.data.data.map((d) => ({
            name: new Date(d.date).toLocaleDateString("en-US", {
              weekday: "short",
            }),
            minutes: Math.round(d.totalDuration / 60000),
          }));
          setDailyData(formattedDailyData);
        }

        if (tagsRes.data.data) {
          const formattedTagData = tagsRes.data.data.map((t) => ({
            name: t._id,
            duration: Math.round(t.totalDuration / 60000),
          }));
          setTagData(formattedTagData);
        }
      } catch (error) {
        toast.error("Failed to load analytics data.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
          <p className="label text-gray-900 dark:text-white">{`${label}`}</p>
          <p className="intro text-gray-700 dark:text-gray-300">{`${payload[0].name}: ${payload[0].value} mins`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Performance Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle>Total Hours This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatMsToHours(summary?.totalDuration)}h
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle>Total Sessions This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary?.totalSessions || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle>Most Focused Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary?.mostUsedTag || "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle>Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {streakData?.currentStreak || 0} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle>Study Consistency (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis unit="m" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
                />
                <Bar
                  dataKey="minutes"
                  name="Minutes"
                  fill="hsl(var(--foreground))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle>Session Breakdown (by Tag)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tagData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis unit="m" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
                />
                <Area
                  type="monotone"
                  dataKey="duration"
                  name="Duration"
                  stroke="hsl(var(--foreground))"
                  fill="hsl(var(--foreground))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
