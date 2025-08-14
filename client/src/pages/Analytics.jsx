import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/api/axios";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatMsToHours = (ms) => {
  if (!ms) return 0;
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

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center">Loading analytics...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="transition-transform hover:scale-110"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Performance Overview</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-800 border-gray-700 animate-fade-in-up transition-transform hover:scale-105">
            <CardHeader>
              <CardTitle>Total Hours This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatMsToHours(summary?.totalDuration)}h
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-gray-800 border-gray-700 animate-fade-in-up transition-transform hover:scale-105"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle>Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalSessions || 0}
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-gray-800 border-gray-700 animate-fade-in-up transition-transform hover:scale-105"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader>
              <CardTitle>Most Focused Tag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.mostUsedTag || "N/A"}
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-gray-800 border-gray-700 animate-fade-in-up transition-transform hover:scale-105"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader>
              <CardTitle>Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {streakData?.currentStreak || 0} days
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card
            className="bg-gray-800 border-gray-700 animate-fade-in-up transition-transform hover:scale-105"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader>
              <CardTitle>Study Consistency (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                  <XAxis dataKey="name" stroke="#A0AEC0" />
                  <YAxis unit="m" stroke="#A0AEC0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2D3748",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="minutes" fill="#4299E1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card
            className="bg-gray-800 border-gray-700 animate-fade-in-up transition-transform hover:scale-105"
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader>
              <CardTitle>Sessions Breakdown (by Tag)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={tagData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                  <XAxis dataKey="name" stroke="#A0AEC0" />
                  <YAxis unit="m" stroke="#A0AEC0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2D3748",
                      border: "none",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="duration"
                    stroke="#38B2AC"
                    fill="#38B2AC"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
