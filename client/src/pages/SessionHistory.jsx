import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/api/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { Edit2 } from "lucide-react";

export default function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({ tag: "", date: "", rating: "" });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({ rating: "", notes: "" });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.tag) queryParams.append("tag", filters.tag);
      if (filters.date) {
        // Create precise start and end ISO strings based on user's LOCAL timezone
        const [year, month, day] = filters.date.split('-');
        const start = new Date(year, month - 1, day, 0, 0, 0);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        queryParams.append("startDate", start.toISOString());
        queryParams.append("endDate", end.toISOString());
      }
      if (filters.rating) queryParams.append("rating", filters.rating);
      queryParams.append("page", page);
      queryParams.append("limit", 10);

      const res = await api.get(`/session/history?${queryParams.toString()}`);
      setSessions(res.data.data.sessions);
      setTotalPages(res.data.data.totalPages);
    } catch (error) {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchSessions();
  }, [filters, page]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/session/update/${editingSession._id}`, editForm);
      toast.success("Session updated");
      setEditingSession(null);
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Session History</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-lg border border-border">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Filter by Tag</label>
            <input 
              type="text" 
              placeholder="e.g. Work"
              className="w-full border border-border bg-background rounded px-3 py-2 text-sm"
              value={filters.tag}
              onChange={(e) => setFilters(f => ({ ...f, tag: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Date</label>
            <input 
              type="date" 
              className="w-full border border-border bg-background rounded px-3 py-2 text-sm"
              value={filters.date}
              onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Rating</label>
            <select 
              className="w-full border border-border bg-background rounded px-3 py-2 text-sm"
              value={filters.rating}
              onChange={(e) => setFilters(f => ({ ...f, rating: e.target.value }))}
            >
              <option value="">Any Rating</option>
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
          </div>
        </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading sessions...</div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Tag</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map(s => (
                <tr key={s._id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">{format(new Date(s.date), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {s.tags[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{(s.duration / 60000).toFixed(0)}m</td>
                  <td className="px-4 py-3">{s.rating || "-"}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{s.notes || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => {
                        setEditingSession(s);
                        setEditForm({ rating: s.rating || "", notes: s.notes || "" });
                      }}
                      className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">No sessions found.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-border rounded bg-background hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-border rounded bg-background hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Edit Session</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <input 
                  type="number" 
                  min="1" max="5" required
                  className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-600"
                  value={editForm.rating}
                  onChange={e => setEditForm({ ...editForm, rating: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-600 h-24"
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
