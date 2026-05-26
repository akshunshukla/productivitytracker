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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, Tag, Loader2 } from "lucide-react";

const CHART_COLORS = [
  "oklch(0.72 0.15 220)",  // sky blue (primary)
  "oklch(0.78 0.15 80)",   // amber
  "oklch(0.68 0.12 200)",  // teal
  "oklch(0.7 0.18 350)",   // rose
  "oklch(0.65 0.13 160)",  // green
  "oklch(0.6 0.15 280)",   // indigo
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-card border border-border rounded-lg shadow-xl text-sm">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-muted-foreground">
          {payload[0].value} {payload[0].name === "hours" ? "hours" : "h"}
        </p>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [summaryRes, dailyRes, tagsRes] = await Promise.all([
          api.get("/analytics/weeklySummary"),
          api.get("/analytics/dailyBreakdown"),
          api.get("/analytics/tagWiseStats"),
        ]);

        setSummary(summaryRes.data.data);

        if (dailyRes.data.data) {
          const formatted = dailyRes.data.data.map((d) => ({
            name: new Date(d.date).toLocaleDateString("en-US", {
              weekday: "short",
            }),
            hours: d.totalHours || parseFloat((d.totalDuration / 3600000).toFixed(1)),
          }));
          setDailyData(formatted);
        }

        if (tagsRes.data.data) {
          const formatted = tagsRes.data.data.map((t) => ({
            name: t._id,
            hours: t.totalHours || parseFloat((t.totalDuration / 3600000).toFixed(1)),
          }));
          setTagData(formatted);
        }
      } catch (error) {
        toast.error("Failed to load analytics data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Hours This Week
                  </p>
                  <p className="text-2xl font-bold">
                    {summary?.totalHours || "0"}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10 text-chart-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Sessions This Week
                  </p>
                  <p className="text-2xl font-bold">
                    {summary?.totalSessions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-3/10 text-chart-3">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Most Focused Tag
                  </p>
                  <p className="text-2xl font-bold">
                    {summary?.mostUsedTag || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hours Per Day (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No session data for this week yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dailyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.25 0.005 260)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="oklch(0.6 0.01 260)"
                      fontSize={12}
                    />
                    <YAxis
                      unit="h"
                      stroke="oklch(0.6 0.01 260)"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="hours"
                      name="hours"
                      fill="oklch(0.72 0.15 220)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tag Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hours By Tag (All Time)</CardTitle>
            </CardHeader>
            <CardContent>
              {tagData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No tag data available yet.
                </p>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={tagData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        dataKey="hours"
                        nameKey="name"
                        strokeWidth={2}
                        stroke="oklch(0.13 0.005 260)"
                      >
                        {tagData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {tagData.map((tag, index) => (
                      <div
                        key={tag.name}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-muted-foreground">
                          {tag.name}{" "}
                          <span className="text-foreground font-medium">
                            {tag.hours}h
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
