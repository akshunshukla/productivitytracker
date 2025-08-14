import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { toast } from "sonner";

const AIInsightsCard = ({ insights }) => {
  const handleRunAnalysis = async () => {
    toast.info("Running AI analysis... This may take a moment.");
    try {
      await api.post("/analytics/run-analysis");
      toast.success("Analysis complete! Refreshing to see new insights.");
      window.location.reload();
    } catch (error) {
      console.error("Analysis Error:", error);

      if (error.response && error.response.status === 503) {
        toast.error("AI model is busy. Please wait a moment and try again.");
      } else {
        toast.error("Failed to run analysis. Please try again.");
      }
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>🚀 AI Habit Analysis</CardTitle>
          <Button size="sm" onClick={handleRunAnalysis}>
            Analyze Now
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {!insights || !insights.habitAnalysis ? (
          <p className="text-sm text-gray-400 h-full flex items-center justify-center">
            Complete a few sessions and click "Analyze Now" to unlock your
            insights!
          </p>
        ) : (
          <>
            <p className="italic text-gray-300">"{insights.habitAnalysis}"</p>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold">Peak Productivity:</h4>
              <p>{insights.peakProductivityTime}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Your Strengths:</h4>
              <div className="flex flex-wrap gap-2">
                {insights.topPerformingTags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-green-700/50 text-white"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Areas to Watch:</h4>
              <div className="flex flex-wrap gap-2">
                {insights.improvementAreaTags?.map((tag) => (
                  <Badge key={tag} variant="destructive">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;
