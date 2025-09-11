import { useState } from "react";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import api from "@/api/axios";
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const CreateGoalDialog = ({ onGoalCreated }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalTags, setNewGoalTags] = useState("");
  const [newGoalPeriod, setNewGoalPeriod] = useState("weekly");
  const [newGoalTarget, setNewGoalTarget] = useState(""); // In hours
  const [newGoalDeadline, setNewGoalDeadline] = useState(null);

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    const targetDurationMs = parseFloat(newGoalTarget) * 60 * 60 * 1000;

    if (!newGoalTitle || !newGoalTags || !newGoalPeriod || !newGoalTarget) {
      toast.error(
        "Please fill out all required fields (Title, Tags, Period, Target)."
      );
      return;
    }

    try {
      const response = await api.post("/goal", {
        title: newGoalTitle,
        description: newGoalDescription,
        tags: newGoalTags.split(",").map((tag) => tag.trim()),
        period: newGoalPeriod,
        targetDuration: targetDurationMs,
        deadline: newGoalDeadline,
      });

      onGoalCreated(response.data.data);
      toast.success("Goal created successfully!");
      setIsDialogOpen(false);

      // Reset form
      setNewGoalTitle("");
      setNewGoalDescription("");
      setNewGoalTags("");
      setNewGoalPeriod("weekly");
      setNewGoalTarget("");
      setNewGoalDeadline(null);
    } catch (error) {
      toast.error("Failed to create goal.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateGoal} className="space-y-4 py-4">
          <div>
            <Label htmlFor="newTitle">Title</Label>
            <Input
              id="newTitle"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="e.g., Learn React"
              required
            />
          </div>
          <div>
            <Label htmlFor="newDescription">Description (Optional)</Label>
            <Textarea
              id="newDescription"
              value={newGoalDescription}
              onChange={(e) => setNewGoalDescription(e.target.value)}
              placeholder="A brief description of your goal."
            />
          </div>
          <div>
            <Label htmlFor="newTags">Tags (comma-separated)</Label>
            <Input
              id="newTags"
              value={newGoalTags}
              onChange={(e) => setNewGoalTags(e.target.value)}
              placeholder="e.g., Coding, Study"
              required
            />
          </div>
          <div>
            <Label htmlFor="newPeriod">Period</Label>
            <Select
              value={newGoalPeriod}
              onValueChange={setNewGoalPeriod}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="newTarget">Target Duration (hours)</Label>
            <Input
              id="newTarget"
              type="number"
              step="0.5"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              placeholder="e.g., 10"
              required
            />
          </div>
          <div>
            <Label htmlFor="newDeadline">Deadline (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newGoalDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newGoalDeadline ? (
                    format(newGoalDeadline, "PPP")
                  ) : (
                    <span>Pick a deadline</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                <Calendar
                  mode="single"
                  selected={newGoalDeadline}
                  onSelect={setNewGoalDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
  );
};

export default CreateGoalDialog;
