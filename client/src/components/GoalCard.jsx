import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

const formatDuration = (ms) => {
  if (ms === undefined || ms === null) return "0h 0m";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const GoalCard = ({ goal, onEdit, onDelete }) => {
  return (
    <Card className="bg-white dark:bg-gray-800/50 flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex justify-between items-center">
          {goal.title}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({goal.period.charAt(0).toUpperCase() + goal.period.slice(1)})
          </span>
        </CardTitle>
        {goal.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {goal.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {goal.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
          <span>Progress:</span>
          <span>
            {formatDuration(goal.loggedDuration)} /{" "}
            {formatDuration(goal.targetDuration)}
          </span>
        </div>
        <Progress
          value={(goal.loggedDuration / goal.targetDuration) * 100 || 0}
          className="w-full"
        />
        <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
          <span>Status:</span>
          <span
            className={`capitalize font-medium ${
              goal.status === "completed"
                ? "text-green-600"
                : goal.status === "in-progress"
                ? "text-yellow-600"
                : "text-gray-500"
            }`}
          >
            {goal.status.replace("-", " ")}
          </span>
        </div>
        {goal.deadline && (
          <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
            <span>Deadline:</span>
            <span>{format(new Date(goal.deadline), "PPP")}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
          <Edit className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-900">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                goal.
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
      </CardFooter>
    </Card>
  );
};

export default GoalCard;
