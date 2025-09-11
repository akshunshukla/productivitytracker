import { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
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

const EditGoalDialog = ({ goal, isOpen, onClose, onGoalUpdated }) => {
  const [editGoalTitle, setEditGoalTitle] = useState(goal?.title || "");
  const [editGoalDescription, setEditGoalDescription] = useState(
    goal?.description || ""
  );
  const [editGoalTags, setEditGoalTags] = useState(
    goal?.tags?.join(", ") || ""
  );
  const [editGoalTarget, setEditGoalTarget] = useState(
    goal ? (goal.targetDuration / (1000 * 60 * 60)).toFixed(2) : ""
  );
  const [editGoalStatus, setEditGoalStatus] = useState(goal?.status || "");
  const [editGoalDeadline, setEditGoalDeadline] = useState(
    goal?.deadline ? new Date(goal.deadline) : null
  );

  useEffect(() => {
    if (goal) {
      setEditGoalTitle(goal.title);
      setEditGoalDescription(goal.description || "");
      setEditGoalTags(goal.tags.join(", "));
      setEditGoalTarget((goal.targetDuration / (1000 * 60 * 60)).toFixed(2));
      setEditGoalStatus(goal.status);
      setEditGoalDeadline(goal.deadline ? new Date(goal.deadline) : null);
    }
  }, [goal]);

  const handleEditGoal = async (e) => {
    e.preventDefault();
    if (!goal) return;

    const targetDurationMs = parseFloat(editGoalTarget) * 60 * 60 * 1000;

    if (!editGoalTitle || !editGoalTags || !editGoalTarget || !editGoalStatus) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      const response = await api.patch(`/goal/${goal._id}`, {
        title: editGoalTitle,
        description: editGoalDescription,
        tags: editGoalTags.split(",").map((tag) => tag.trim()),
        targetDuration: targetDurationMs,
        status: editGoalStatus,
        deadline: editGoalDeadline,
      });

      onGoalUpdated(response.data.data);
      toast.success("Goal updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update goal.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Edit Goal: {goal?.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditGoal} className="space-y-4 py-4">
          <div>
            <Label htmlFor="editTitle">Title</Label>
            <Input
              id="editTitle"
              value={editGoalTitle}
              onChange={(e) => setEditGoalTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="editDescription">Description (Optional)</Label>
            <Textarea
              id="editDescription"
              value={editGoalDescription}
              onChange={(e) => setEditGoalDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="editTags">Tags (comma-separated)</Label>
            <Input
              id="editTags"
              value={editGoalTags}
              onChange={(e) => setEditGoalTags(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="editTarget">Target Duration (hours)</Label>
            <Input
              id="editTarget"
              type="number"
              step="0.5"
              value={editGoalTarget}
              onChange={(e) => setEditGoalTarget(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="editStatus">Status</Label>
            <Select value={editGoalStatus} onValueChange={setEditGoalStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="editDeadline">Deadline (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !editGoalDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editGoalDeadline ? (
                    format(editGoalDeadline, "PPP")
                  ) : (
                    <span>Pick a deadline</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                <Calendar
                  mode="single"
                  selected={editGoalDeadline}
                  onSelect={setEditGoalDeadline}
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalDialog;
