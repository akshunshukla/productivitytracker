import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { formatDuration } from "@/utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const SessionTimer = () => {
  const { currentSession, pauseSession, resumeSession, endSession } =
    useSession();
  const [elapsedTime, setElapsedTime] = useState(0);

  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState("");
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentSession) {
      setElapsedTime(0);
      return;
    }

    let initialTime = currentSession.duration;
    if (currentSession.status === "active") {
      const lastInterval =
        currentSession.intervals[currentSession.intervals.length - 1];
      initialTime += Date.now() - new Date(lastInterval.startTime).getTime();
    }
    setElapsedTime(initialTime);

    if (currentSession.status === "active") {
      const interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1000);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentSession]);

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

  return (
    <Card className="bg-white dark:bg-gray-800/50 text-center">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">
          Session Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-6xl font-bold my-4 text-gray-900 dark:text-white">
          {formatDuration(elapsedTime / 1000)}
        </div>
        <div className="flex justify-center gap-4">
          {!currentSession ? (
            <Button disabled size="lg">
              Start a Task to Begin
            </Button>
          ) : currentSession.status === "active" ? (
            <Button onClick={pauseSession} variant="secondary" size="lg">
              Pause
            </Button>
          ) : (
            <Button onClick={resumeSession} size="lg">
              Resume
            </Button>
          )}

          <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                disabled={!currentSession}
              >
                End
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle>Complete Your Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Session Rating (1-5)</Label>
                  <Select onValueChange={setRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="How was your focus?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="3">3 - Okay</SelectItem>
                      <SelectItem value="2">2 - Poor</SelectItem>
                      <SelectItem value="1">1 - Very Bad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any thoughts?"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={handleEndSessionSubmit}>End & Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTimer;
