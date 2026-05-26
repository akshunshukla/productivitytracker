import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import api from "@/api/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Clock,
  TrendingUp,
  Brain,
  Target,
  Lightbulb,
  Loader2,
  Sparkles,
  Star,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORY_CONFIG = {
  timeDistribution: {
    icon: Clock,
    title: "Time Distribution",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  productivityPatterns: {
    icon: TrendingUp,
    title: "Productivity Patterns",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  focusQuality: {
    icon: Brain,
    title: "Focus Quality",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  goalProgress: {
    icon: Target,
    title: "Goal Progress",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
};

const PRIORITY_STYLES = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  low: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

const InsightCard = ({ categoryKey, data }) => {
  const config = CATEGORY_CONFIG[categoryKey];
  if (!config || !data) return null;

  const Icon = config.icon;

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base gap-2">
          <div className={`p-1.5 rounded-md ${config.bgColor}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground/80">{data.summary}</p>

        {/* Extra meta for productivity patterns */}
        {categoryKey === "productivityPatterns" && (
          <div className="flex gap-3">
            {data.peakDay && (
              <div className="text-xs">
                <span className="text-muted-foreground">Peak Day: </span>
                <span className="font-medium">{data.peakDay}</span>
              </div>
            )}
            {data.peakTime && (
              <div className="text-xs">
                <span className="text-muted-foreground">Peak Time: </span>
                <span className="font-medium">{data.peakTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Extra meta for focus quality */}
        {categoryKey === "focusQuality" && (
          <div className="flex gap-3 flex-wrap">
            {data.avgRating > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 text-chart-2 fill-chart-2" />
                <span className="text-muted-foreground">Avg: </span>
                <span className="font-medium">{data.avgRating}</span>
              </div>
            )}
            {data.bestTag && (
              <div className="text-xs">
                <span className="text-muted-foreground">Best: </span>
                <span className="font-medium">{data.bestTag}</span>
              </div>
            )}
            {data.worstTag && data.worstTag !== data.bestTag && (
              <div className="text-xs">
                <span className="text-muted-foreground">Needs work: </span>
                <span className="font-medium">{data.worstTag}</span>
              </div>
            )}
          </div>
        )}

        {/* Insights list */}
        {data.insights && data.insights.length > 0 && (
          <ul className="space-y-1.5">
            {data.insights.map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${config.bgColor.replace('/10', '')}`} />
                {insight}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const InsightsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info("Running AI analysis... This may take a moment.");
    try {
      await api.post("/analytics/run-analysis");
      toast.success("Analysis complete! Refresh to see your new insights.", {
        description: "Please refresh the page to see the latest report.",
      });
      // Reload to show updated aiInsights from user profile
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to run analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const insights = user?.aiInsights;
  const hasInsights =
    insights &&
    (insights.timeDistribution?.summary ||
      insights.productivityPatterns?.summary ||
      insights.focusQuality?.summary ||
      insights.goalProgress?.summary);

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <Button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Analysis
              </>
            )}
          </Button>
        </div>

        {authLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !hasInsights ? (
          <Card className="text-center py-16">
            <CardContent>
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold">No Analysis Yet</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Complete a few sessions with ratings, then click "Generate
                Analysis" to get personalized AI insights about your
                productivity patterns.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Last analyzed timestamp */}
            {insights.lastAnalyzed && (
              <p className="text-xs text-muted-foreground">
                Last analyzed:{" "}
                {format(new Date(insights.lastAnalyzed), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsightCard
                categoryKey="timeDistribution"
                data={insights.timeDistribution}
              />
              <InsightCard
                categoryKey="productivityPatterns"
                data={insights.productivityPatterns}
              />
              <InsightCard
                categoryKey="focusQuality"
                data={insights.focusQuality}
              />
              <InsightCard
                categoryKey="goalProgress"
                data={insights.goalProgress}
              />
            </div>

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <Card className="animate-slide-up">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base gap-2">
                    <div className="p-1.5 rounded-md bg-chart-5/10">
                      <Lightbulb className="w-4 h-4 text-chart-5" />
                    </div>
                    Recommendations
                  </CardTitle>
                  <CardDescription>
                    Actionable suggestions based on your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        <span className="text-sm font-bold text-muted-foreground mt-0.5">
                          {index + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">
                              {rec.title}
                            </h4>
                            {rec.priority && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${
                                  PRIORITY_STYLES[rec.priority] || ""
                                }`}
                              >
                                {rec.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InsightsPage;
