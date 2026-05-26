import { useState, useEffect } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
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

const EditGoalDialog = ({ goal, isOpen, onClose, onGoalUpdated }) => {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || "");
      setTag(goal.tag || "");
      setTargetHours(
        goal.targetDuration
          ? (goal.targetDuration / (60 * 60 * 1000)).toString()
          : ""
      );
      setDescription(goal.description || "");
      setDeadline(
        goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : ""
      );
      setStatus(goal.status || "not-started");
    }
  }, [goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !tag || !targetHours) {
      toast.error("Title, tag, and target hours are required.");
      return;
    }

    const targetDurationMs = parseFloat(targetHours) * 60 * 60 * 1000;

    try {
      const response = await api.patch(`/goal/${goal._id}`, {
        title,
        tag: tag.trim(),
        targetDuration: targetDurationMs,
        description,
        deadline: deadline || null,
        status,
      });

      toast.success("Goal updated successfully!");
      onGoalUpdated?.(response.data.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update goal.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-goal-title">Goal Title</Label>
            <Input
              id="edit-goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-goal-tag">Tag</Label>
            <Input
              id="edit-goal-tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-secondary mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-goal-target">Target Hours</Label>
            <Input
              id="edit-goal-target"
              type="number"
              step="0.5"
              min="0.5"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              className="bg-secondary mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-goal-deadline">Deadline</Label>
            <Input
              id="edit-goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-secondary mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-goal-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="edit-goal-status" className="bg-secondary mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-goal-desc">Description</Label>
            <Textarea
              id="edit-goal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary mt-1"
            />
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
