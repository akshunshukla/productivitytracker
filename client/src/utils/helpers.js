// Format duration in seconds to HH:MM:SS
export const formatDuration = (seconds) => {
  if (typeof seconds !== "number" || seconds < 0) return "00:00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return [hours, minutes, secs].map((v) => String(v).padStart(2, "0")).join(":");
};

// Format ms to hours string
export const formatHours = (ms) => {
  if (!ms || ms <= 0) return "0h";
  const hours = ms / (1000 * 60 * 60);
  if (hours < 0.1) return `${Math.round(ms / (1000 * 60))}m`;
  return `${hours.toFixed(1)}h`;
};

// Format ms to hours and minutes string
export const formatHoursMinutes = (ms) => {
  if (!ms || ms <= 0) return "0h 0m";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Format ISO date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// Calculate days overdue
export const getDaysOverdue = (deadline) => {
  if (!deadline) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffMs = now - deadlineDate;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};
