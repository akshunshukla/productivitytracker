import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/context/SessionContext";
import { formatDuration } from "@/utils/helpers";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Square } from "lucide-react";
import StartSessionDialog from "./StartSessionDialog";

const SessionTimer = () => {
  const { currentSession, pauseSession, resumeSession, endSession } =
    useSession();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState("");
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

  // Calculate true elapsed time from server intervals
  const calculateElapsed = useCallback(() => {
    if (!currentSession) return 0;

    let total = currentSession.duration;

    if (currentSession.status === "active") {
      const lastInterval =
        currentSession.intervals[currentSession.intervals.length - 1];
      total += Date.now() - new Date(lastInterval.startTime).getTime();
    }

    return total;
  }, [currentSession]);

  useEffect(() => {
    if (!currentSession) {
      setElapsedTime(0);
      return;
    }


    setElapsedTime(calculateElapsed());

    if (currentSession.status === "active") {

      const interval = setInterval(() => {
        setElapsedTime(calculateElapsed());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession, calculateElapsed]);


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && currentSession?.status === "active") {
        setElapsedTime(calculateElapsed());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentSession, calculateElapsed]);

  const handleEndSessionSubmit = () => {
    if (!rating) {
      toast.error("Please provide a rating.");
      return;
    }
    endSession({ rating: parseInt(rating), notes });
    setIsEndDialogOpen(false);
    setRating(null);
    setNotes("");
  };

  const currentTag = currentSession?.tags?.[0] || "";

  return (
    <Card className="glass-card glow-primary">
      <CardContent className="py-5">
        <div className="flex flex-col items-center text-center">
          {/* Tag + Status */}
          {currentSession && (
            <div className="mb-1.5 animate-fade-in">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                {currentTag}
              </span>
              <span className="ml-2 text-[11px] text-muted-foreground">
                {currentSession.status === "paused" ? "⏸ Paused" : "● Recording"}
              </span>
            </div>
          )}

          {/* Timer Display */}
          <div className="font-mono text-4xl lg:text-5xl font-bold tracking-tight tabular-nums my-1">
            {formatDuration(elapsedTime / 1000)}
          </div>

          {/* Controls — centered below timer */}
          <div className="flex gap-2 mt-3">
            {!currentSession ? (
              <StartSessionDialog>
                <Button size="default" className="gap-2">
                  <Play className="w-4 h-4" />
                  Start Session
                </Button>
              </StartSessionDialog>
            ) : (
              <>
                {currentSession.status === "active" ? (
                  <Button
                    onClick={pauseSession}
                    variant="secondary"
                    size="default"
                    className="gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={resumeSession}
                    size="default"
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                )}
                <Dialog
                  open={isEndDialogOpen}
                  onOpenChange={setIsEndDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="default" className="gap-2">
                      <Square className="w-4 h-4" />
                      End
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Your Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>How was your focus? (1-5)</Label>
                        <Select onValueChange={setRating}>
                          <SelectTrigger id="session-rating" className="bg-secondary mt-1">
                            <SelectValue placeholder="Select a rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 — Excellent</SelectItem>
                            <SelectItem value="4">4 — Good</SelectItem>
                            <SelectItem value="3">3 — Okay</SelectItem>
                            <SelectItem value="2">2 — Poor</SelectItem>
                            <SelectItem value="1">1 — Very Bad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes (optional)</Label>
                        <Textarea
                          id="session-notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any thoughts about this session?"
                          className="bg-secondary mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="ghost">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button onClick={handleEndSessionSubmit}>
                        End & Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTimer;
