import { useState, useEffect, useCallback } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
import { ChevronsUpDown, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import AIInsightsCard from "../components/AIInsightsCard";
import useAuth from "../hooks/useAuth";

const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

const Tracker = () => {
  const { user } = useAuth();

  const [currentSession, setCurrentSession] = useState(null);

  const [elapsedTime, setElapsedTime] = useState(0);

  const [tags, setTags] = useState([]);

  const [lastFiveSessions, setLastFiveSessions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [tagValue, setTagValue] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);

  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState("");

  const [todaysHours, setTodaysHours] = useState(0);
  const [quote, setQuote] = useState({
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sessionRes, tagsRes, lastFiveRes, todaySummaryRes] =
        await Promise.all([
          api.get("/session/current"),
          api.get("/analytics/tags"),
          api.get("/analytics/last-five"),
          api.get("/analytics/todays-summary"),
        ]);

      setCurrentSession(sessionRes.data.data);
      if (tagsRes.data.data) setTags(tagsRes.data.data);
      if (lastFiveRes.data.data) setLastFiveSessions(lastFiveRes.data.data);
      if (todaySummaryRes.data.data) {
        setTodaysHours(todaySummaryRes.data.data.totalDuration);
      }
    } catch (error) {
      toast.error("Failed to fetch session data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const fetchQuote = async () => {
      const today = new Date().toISOString().split("T")[0];
      const storedQuoteData = localStorage.getItem("dailyQuote");

      if (storedQuoteData) {
        const { date, quote } = JSON.parse(storedQuoteData);
        if (date === today) {
          setQuote(quote);
          return;
        }
      }

      try {
        const response = await api.get("/quote/generate");
        const newQuote = response.data.data;
        setQuote(newQuote);

        localStorage.setItem(
          "dailyQuote",
          JSON.stringify({ date: today, quote: newQuote })
        );
      } catch (error) {
        console.error("Failed to fetch daily quote:", error);
      }
    };

    fetchQuote();
  }, []);

  // timer logic
  useEffect(() => {
    let interval;

    if (currentSession?.status === "active") {
      const initialDuration = currentSession.duration || 0;
      const lastIntervalStartTime = new Date(
        currentSession.intervals[currentSession.intervals.length - 1].startTime
      );
      const now = new Date();
      const initialElapsedTime =
        initialDuration + (now - lastIntervalStartTime);

      setElapsedTime(initialElapsedTime);

      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1000);
      }, 1000);
    } else if (currentSession?.status === "paused") {
      setElapsedTime(currentSession.duration);
    }
    return () => clearInterval(interval);
  }, [currentSession]);

  const handleStartSession = async () => {
    if (!tagValue) {
      toast.error("Please select or create a tag to start a session.");
      return;
    }
    try {
      const response = await api.post("/session/startSession", {
        tag: [tagValue],
      });
      setCurrentSession(response.data.data);
      toast.success(`Session started with tag: ${tagValue}`);

      if (!tags.includes(tagValue)) {
        setTags((prevTags) => [...prevTags, tagValue]);
      }
      setTagValue("");
      document.getElementById("start-dialog-close").click();
    } catch (error) {
      toast.error("Failed to start session.");
    }
  };

  const handlePauseSession = async () => {
    try {
      const response = await api.patch(
        `/session/pauseSession/${currentSession._id}`
      );
      setCurrentSession(response.data.data);
      toast.info("Session paused.");
    } catch (error) {
      toast.error("Failed to pause session.");
    }
  };

  const handleResumeSession = async () => {
    try {
      const response = await api.patch(
        `/session/resumeSession/${currentSession._id}`
      );
      setCurrentSession(response.data.data);
      toast.success("Session resumed.");
    } catch (error) {
      toast.error("Failed to resume session.");
    }
  };

  const handleEndSession = async () => {
    if (!rating) {
      toast.error("Please provide a rating for the session.");
      return;
    }
    try {
      await api.post(`/session/end/${currentSession._id}`, {
        rating: parseInt(rating),
        notes: notes,
      });
      toast.success("Session completed and recorded!");
      document.getElementById("end-dialog-close").click();

      const resetSessionState = () => {
        setCurrentSession(null);
        setElapsedTime(0);
        setRating(null);
        setNotes("");
      };

      resetSessionState();

      await fetchAllData();
    } catch (error) {
      toast.error("Failed to end session.");
    }
  };

  const handleDeleteSession = async (sessionIdToDelete) => {
    try {
      await api.delete(`/session/deleteSession/${sessionIdToDelete}`);

      setLastFiveSessions((prevSessions) =>
        prevSessions.filter((session) => session._id !== sessionIdToDelete)
      );

      toast.success("Session deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete the session.");
      console.error("Delete Error:", error);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column*/}
        <div className="md:col-span-2 space-y-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Session Control</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-7xl font-mono font-bold my-8">
                {formatTime(elapsedTime)}
              </div>
              <div className="flex justify-center gap-4">
                {!currentSession ? (
                  // If there is no active session, show the "Start" button
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg">Start</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-[#6096ba] border-gray-700">
                      <DialogHeader>
                        <DialogTitle>Start a New Session</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="tag-select">Focus Tag</Label>
                        <Popover
                          open={openCombobox}
                          onOpenChange={setOpenCombobox}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="w-full justify-between"
                            >
                              {tagValue
                                ? tags.find(
                                    (tag) =>
                                      tag.toLowerCase() ===
                                      tagValue.toLowerCase()
                                  ) || `Create "${tagValue}"`
                                : "Select or create a tag..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-99 bg-[#6096ba]">
                            <Command>
                              <CommandInput
                                placeholder="Search tag or create new..."
                                onValueChange={setTagValue}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  <p className="p-2 text-sm">
                                    No tag found. Type to create.
                                  </p>
                                </CommandEmpty>
                                <CommandGroup>
                                  {tags.map((tag) => (
                                    <CommandItem
                                      key={tag}
                                      value={tag}
                                      onSelect={(currentValue) => {
                                        setTagValue(
                                          currentValue === tagValue
                                            ? ""
                                            : currentValue
                                        );
                                        setOpenCombobox(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          tagValue.toLowerCase() ===
                                            tag.toLowerCase()
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {tag}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleStartSession}>
                          Start Session
                        </Button>
                        <DialogClose asChild>
                          <Button id="start-dialog-close" variant="ghost">
                            Cancel
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : currentSession.status === "active" ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={handlePauseSession}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleResumeSession}>
                    Resume
                  </Button>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      variant="destructive"
                      disabled={!currentSession}
                    >
                      End Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[#6096ba] border-gray-700">
                    <DialogHeader>
                      <DialogTitle>Complete Your Session</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 ">
                      <div>
                        <Label htmlFor="rating">Session Rating (1-5)</Label>
                        <Select onValueChange={setRating}>
                          <SelectTrigger id="rating" className="w-full">
                            <SelectValue placeholder="How was your focus?" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#6096ba]">
                            <SelectItem value="5">5 - Excellent</SelectItem>
                            <SelectItem value="4">4 - Good</SelectItem>
                            <SelectItem value="3">3 - Okay</SelectItem>
                            <SelectItem value="2">2 - Poor</SelectItem>
                            <SelectItem value="1">1 - Very Bad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any thoughts on this session?"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleEndSession}>
                        End & Save Session
                      </Button>
                      <DialogClose asChild>
                        <Button id="end-dialog-close" variant="ghost">
                          Cancel
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Last 5 Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p>Loading sessions...</p>
                ) : lastFiveSessions.length > 0 ? (
                  lastFiveSessions.map((session) => (
                    <div
                      key={session._id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold">
                          {session.tags.join(", ")}
                        </span>
                        <p className="text-sm text-gray-400">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-400">
                          {Math.round(session.duration / 60000)}m
                        </span>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#6096ba] border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this session record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSession(session._id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No completed sessions yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column*/}
        <div className="space-y-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Today's Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src="/motivational-quote-icon.png"
                  alt="Focus"
                  className="w-16 h-16"
                />
                <div>
                  <p className="font-bold">"{quote.text}"</p>
                  <p className="text-sm text-gray-400 text-right">
                    - {quote.author}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <AIInsightsCard insights={user?.aiInsights} />

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Hours Tracked Today</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="text-4xl font-bold">
                {formatTime(todaysHours, "h")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Tracker;
