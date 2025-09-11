import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import api from "@/api/axios";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TodayTasks = () => {
  const { startSession } = useSession();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for the "New Task" form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState("CHECKLIST");
  const [selectedGoalId, setSelectedGoalId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const tasksResponse = await api.get("/task/today");
        setTasks(tasksResponse.data.data);

        const goalResponse = await api.get("/goal");
        setGoals(goalResponse.data.data);
      } catch (error) {
        toast.error("Failed to fetch tasks or goals.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!newTaskTitle) {
      toast.error("Task title cannot be empty.");
      return;
    }

    if (newTaskType === "TRACKABLE" && !selectedGoalId) {
      toast.error("Please select a goal for trackable tasks.");
      return;
    }
    try {
      const response = await api.post("/task", {
        title: newTaskTitle,
        type: newTaskType,
        goalId: newTaskType === "TRACKABLE" ? selectedGoalId : null,
      });

      setTasks((prevTasks) => [response.data.data, ...prevTasks]);
      toast.success("Task created successfully!");

      setNewTaskTitle("");
      setNewTaskType("CHECKLIST");
      setSelectedGoalId("");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create task.");
      console.error(error);
    }
  };
  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "todo" ? "done" : "todo";

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await api.patch(`/task/${taskId}`, { status: newStatus });
      toast.success("Task status updated.");
    } catch (error) {
      toast.error("Failed to update task status.");
      console.error(error);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: currentStatus } : task
        )
      );
    }
  };

  const handleStartSessionForTask = (task) => {
    const associatedGoal = goals.find((g) => g._id === task.goalId);
    const sessionTags = associatedGoal ? associatedGoal.tags : [];

    startSession({
      taskId: task._id,
      goalId: task.goalId,
      tags: sessionTags,
    });
  };

  return (
    <Card className="bg-white dark:bg-gray-800/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900 dark:text-white">
          Today's Tasks
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle>Create a New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Read documentation"
                  required
                />
              </div>
              <div>
                <Label htmlFor="taskType">Task Type</Label>
                <Select value={newTaskType} onValueChange={setNewTaskType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKLIST">
                      Simple Checklist Task
                    </SelectItem>
                    <SelectItem value="TRACKABLE">
                      Trackable Task (Linked to Goal)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newTaskType === "TRACKABLE" && (
                <div>
                  <Label htmlFor="goalSelect">Link to Goal</Label>
                  <Select
                    value={selectedGoalId}
                    onValueChange={setSelectedGoalId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.length === 0 ? (
                        <SelectItem value="" disabled>
                          No goals available
                        </SelectItem>
                      ) : (
                        goals.map((goal) => (
                          <SelectItem key={goal._id} value={goal._id}>
                            {goal.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No tasks for today. Add one!
          </p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  {task.type === "CHECKLIST" ? (
                    <Checkbox
                      id={`task-${task._id}`}
                      checked={task.status === "done"}
                      onCheckedChange={() =>
                        handleToggleTaskStatus(task._id, task.status)
                      }
                      className="mr-3"
                    />
                  ) : (
                    <span className="w-4 h-4 mr-3" />
                  )}
                  <Label
                    htmlFor={`task-${task._id}`}
                    className={`${
                      task.status === "done"
                        ? "line-through text-gray-500"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {task.title}
                  </Label>
                </div>
                {task.type === "TRACKABLE" && task.status !== "done" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartSessionForTask(task)}
                  >
                    Start
                  </Button>
                )}
                {/*"Edit" or "Delete" button here later */}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default TodayTasks;
