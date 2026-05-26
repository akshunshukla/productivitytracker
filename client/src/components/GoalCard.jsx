import { formatHoursMinutes, getDaysOverdue, formatDate } from "@/utils/helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Clock, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const GoalCard = ({ goal, onEdit, onDelete }) => {
  const progressPct =
    goal.targetDuration > 0
      ? Math.min((goal.loggedDuration / goal.targetDuration) * 100, 100)
      : 0;

  const remainingMs = Math.max(goal.targetDuration - goal.loggedDuration, 0);
  const daysOverdue = getDaysOverdue(goal.deadline);
  const isCompleted = goal.status === "completed";

  return (
    <Card
      className={`transition-all duration-200 hover:border-primary/30 ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <CardContent className="pt-5 pb-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{goal.title}</h3>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
              {goal.tag}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{goal.title}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this goal and its progress.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(goal._id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              {formatHoursMinutes(goal.loggedDuration)} /{" "}
              {formatHoursMinutes(goal.targetDuration)}
            </span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {remainingMs > 0
              ? `${formatHoursMinutes(remainingMs)} left`
              : "Target reached!"}
          </div>
          {goal.deadline && (
            <div
              className={`flex items-center gap-1 ${
                daysOverdue > 0 ? "text-destructive" : ""
              }`}
            >
              <Calendar className="w-3 h-3" />
              {daysOverdue > 0
                ? `${daysOverdue}d overdue`
                : formatDate(goal.deadline)}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isCompleted
                ? "bg-chart-5/10 text-chart-5"
                : goal.status === "in-progress"
                ? "bg-chart-2/10 text-chart-2"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {goal.status === "not-started"
              ? "Not Started"
              : goal.status === "in-progress"
              ? "In Progress"
              : "Completed"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
