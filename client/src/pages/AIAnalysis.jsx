import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import api from "@/api/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  Loader2,
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

const AIAnalysisPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info("Starting in-depth analysis... This may take a moment.");
    try {
      await api.post("/analytics/run-analysis");
      toast.success("Analysis complete! Your new insights are ready.", {
        description: "Please refresh the page to see the latest report.",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to run analysis.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const insights = user?.aiInsights;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          AI Productivity Coach
        </h1>
        <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New Analysis
            </>
          )}
        </Button>
      </div>

      {authLoading ? (
        <p>Loading user data...</p>
      ) : !insights || !insights.coreInsight ? (
        <Card className="text-center p-8 bg-white dark:bg-gray-800/50">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            No analysis found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track a few sessions with ratings, then click the button above to
            generate your first personalized productivity report.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="mr-3 text-green-500" /> Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {insights.keyStrengths?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-3 text-yellow-500" /> Key
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {insights.keyOpportunities?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-3 text-blue-500" /> Core Insight
              </CardTitle>
              <CardDescription>
                Last analyzed on:{" "}
                {format(new Date(insights.lastAnalyzed), "PPP p")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{insights.coreInsight}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-3 text-red-500" /> Actionable Suggestion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{insights.actionableSuggestion}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Peak Productivity Time</h3>
                <p>{insights.peakProductiveTime}</p>
              </div>
              <div>
                <h3 className="font-semibold">Top Performing Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {insights.topPerformingTags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">
                  Tags with Room for Improvement
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {insights.improvementAreaTags?.map((tag) => (
                    <Badge key={tag} variant="destructive">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AIAnalysisPage;
