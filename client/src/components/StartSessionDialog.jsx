import { useState, useEffect } from "react";
import api from "@/api/axios";
import { useSession } from "@/context/SessionContext";
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

const StartSessionDialog = ({ children }) => {
  const { startSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [tag, setTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchUserTags = async () => {
        try {
          const response = await api.get("/analytics/tags");
          setAvailableTags(response.data.data || []);
        } catch (error) {

        }
      };
      fetchUserTags();
    }
  }, [isOpen]);

  const handleStartSession = () => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) {
      toast.error("Please enter a tag to start a session.");
      return;
    }
    startSession({ tag: trimmedTag });
    setIsOpen(false);
    setTag("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleStartSession();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Session</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div>
            <Label htmlFor="session-tag">What are you working on?</Label>
            <Input
              id="session-tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., DSA, React, Reading..."
              className="bg-secondary mt-1"
              autoFocus
            />
          </div>

          {availableTags.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Your recent tags:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      tag === t
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            If a goal exists with this tag, your session will automatically count
            towards it.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleStartSession}>Start Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartSessionDialog;
