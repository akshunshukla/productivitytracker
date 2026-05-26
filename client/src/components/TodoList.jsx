import { useState, useEffect } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/task/today");
      setTasks(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    try {
      const response = await api.post("/task", { title });
      setTasks((prev) => [...prev, response.data.data]);
      setNewTaskTitle("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task.");
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const response = await api.patch(`/task/${taskId}`, {
        completed: !currentCompleted,
      });
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? response.data.data : task))
      );
    } catch (error) {
      toast.error("Failed to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/task/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (error) {
      toast.error("Failed to delete task.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <CheckSquare className="w-4 h-4 mr-2 text-primary" />
          Today's Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Task */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
          <Input
            id="new-task-input"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            className="bg-secondary text-sm"
          />
          <button
            type="submit"
            className="p-2 rounded-md hover:bg-primary/10 text-primary transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Task List */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks for today. Add one above!
          </p>
        ) : (
          <ul className="space-y-1">
            {tasks.map((task) => (
              <li
                key={task._id}
                className="flex items-center gap-3 py-2 px-2 rounded-md group hover:bg-secondary/50 transition-colors"
              >
                <Checkbox
                  id={`task-${task._id}`}
                  checked={task.completed}
                  onCheckedChange={() =>
                    handleToggleTask(task._id, task.completed)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor={`task-${task._id}`}
                  className={`flex-1 text-sm cursor-pointer select-none ${
                    task.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {task.title}
                </label>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TodoList;
