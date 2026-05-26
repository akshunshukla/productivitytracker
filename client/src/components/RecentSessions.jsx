import { useState, useEffect } from "react";
import api from "@/api/axios";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { History, Loader2, Trash2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatHours } from "@/utils/helpers";

const RecentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteSession, sessionUpdated } = useSession();

  useEffect(() => {
    const fetchRecentSessions = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/analytics/last-five");
        setSessions(response.data.data || []);
      } catch (error) {
        toast.error("Failed to fetch recent sessions.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentSessions();
  }, [sessionUpdated]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <History className="w-4 h-4 mr-2 text-chart-3" />
          Recent Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No completed sessions yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li
                key={session._id}
                className="flex justify-between items-center group py-1"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {session.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {session.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-chart-2">
                        <Star className="w-3 h-3 fill-current" />
                        {session.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(session.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-medium text-sm">
                    {formatHours(session.duration)}
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this session. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSession(session._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSessions;
