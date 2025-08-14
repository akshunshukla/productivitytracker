/**
 * Formats a duration in seconds into a "HH:MM:SS" string.
 * @ param {number} seconds - The total duration in seconds.
 * @ returns {string} The formatted time string.
 */
export const formatDuration = (seconds) => {
  if (typeof seconds !== 'number' || seconds < 0) return "00:00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return [hours, minutes, secs]
    .map(v => String(v).padStart(2, '0'))
    .join(':');
};

/**
 * Formats an ISO date string into a readable format (e.g., "Jul 23, 2025, 01:25 AM").
 * @param {string} dateString - The ISO date string from the server.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error("Invalid date string:", dateString);
    return "Invalid Date";
  }
};
