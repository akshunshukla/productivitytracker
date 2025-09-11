import { useState, useEffect } from "react";
import api from "@/api/axios";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const formatDuration = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const Goals = () => {
  const { needsGoalRefresh, setNeedsGoalRefresh } = useSession();
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalPeriod, setNewGoalPeriod] = useState("weekly");
  const [newGoalTags, setNewGoalTags] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/goal");
      setGoals(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch goals.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchGoals();
  }, []);
  useEffect(() => {
    if (needsGoalRefresh) {
      toast.info("Refreshing goals...");
      fetchGoals();
      setNeedsGoalRefresh(false);
    }
  }, [needsGoalRefresh, setNeedsGoalRefresh]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    const targetDurationMs = parseFloat(newGoalTarget) * 60 * 60 * 1000;

    if (!newGoalTags || !newGoalTitle || !newGoalTarget) {
      toast.error("Please fill out all required details");
      return;
    }
    try {
      const response = await api.post("/goal", {
        title: newGoalTitle,
        tags: newGoalTags.split(",").map((tag) => tag.trim()),
        period: newGoalPeriod,
        targetDuration: targetDurationMs,
      });

      setGoals((prevGoals) => [response.data.data, ...prevGoals]);

      toast.success("Goal created successfully!");
      setIsDialogOpen(false);

      setNewGoalTitle("");
      setNewGoalTags("");
      setNewGoalTarget("");
    } catch (error) {
      toast.error("Failed to create goal.");
      console.error(error);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900 dark:text-white"> Goals </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle>Create a New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <Label htmlFor="title"> Goal Title</Label>
                <Input
                  id="title"
                  value={newGoalTags}
                  onChange={(e) => setNewGoalTags(e.target.value)}
                  placeholder="e.g., React, Study (comma-separated)"
                />
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <Select value={newGoalPeriod} onValueChange={setNewGoalPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target">Target (in hours)</Label>
                <Input
                  id="target"
                  type="number"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="e.g., 10"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Goal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading goals...</p>
          ) : goals.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No goals created yet. Add one to get started!
            </p>
          ) : (
            goals.map((goal) => (
              <div key={goal._id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {goal.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(goal.loggedDuration)} /{" "}
                    {formatDuration(goal.targetDuration)}
                  </span>
                </div>
                <Progress
                  value={(goal.loggedDuration / goal.targetDuration) * 100}
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Goals;
