import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CreateGoalDialog = ({ children, onGoalCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const resetForm = () => {
    setTitle("");
    setTag("");
    setTargetHours("");
    setDescription("");
    setDeadline("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !tag || !targetHours) {
      toast.error("Title, tag, and target hours are required.");
      return;
    }

    const targetDurationMs = parseFloat(targetHours) * 60 * 60 * 1000;

    try {
      const response = await api.post("/goal", {
        title,
        tag: tag.trim(),
        targetDuration: targetDurationMs,
        description,
        deadline: deadline || null,
      });

      toast.success("Goal created successfully!");
      onGoalCreated?.(response.data.data);
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create goal.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal-title">Goal Title</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master React Hooks"
              className="bg-secondary mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="goal-tag">Tag</Label>
            <Input
              id="goal-tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g., react"
              className="bg-secondary mt-1"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sessions with this tag will auto-count towards this goal.
            </p>
          </div>
          <div>
            <Label htmlFor="goal-target">Target Hours</Label>
            <Input
              id="goal-target"
              type="number"
              step="0.5"
              min="0.5"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              placeholder="e.g., 40"
              className="bg-secondary mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="goal-deadline">Deadline (optional)</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-secondary mt-1"
            />
          </div>
          <div>
            <Label htmlFor="goal-description">Description (optional)</Label>
            <Textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to achieve?"
              className="bg-secondary mt-1"
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
  );
};

export default CreateGoalDialog;
