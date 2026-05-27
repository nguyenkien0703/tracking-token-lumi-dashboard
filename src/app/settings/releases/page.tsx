"use client";

import { useCallback, useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

type Release = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
};

type FormState = {
  name: string;
  start_date: string;
  end_date: string;
  notes: string;
};

const emptyForm: FormState = { name: "", start_date: "", end_date: "", notes: "" };

export default function ReleasesSettingsPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/savameta/releases");
      const json = await res.json();
      setReleases(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name.trim(),
      start_date: form.start_date,
      end_date: form.end_date || null,
      notes: form.notes.trim() || null,
    };

    const isEdit = editingId !== null;
    const res = await fetch("/api/savameta/releases", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { id: editingId, ...payload } : payload),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Save failed");
      return;
    }

    resetForm();
    fetchReleases();
  };

  const handleEdit = (r: Release) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      start_date: r.start_date,
      end_date: r.end_date ?? "",
      notes: r.notes ?? "",
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete release "${name}"?`)) return;
    await fetch(`/api/savameta/releases?id=${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    fetchReleases();
  };

  const inputClass =
    "w-full bg-surface-2 border border-border-default rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary";

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        icon={<Rocket className="w-5 h-5" />}
        iconGradient="amber"
        title="Releases"
        subtitle='Định nghĩa các đợt rollout LumiAI cho Savameta. Dùng để compute "New joiners by release".'
      />

      <section className="bg-surface border border-border-default rounded-[10px] p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          {editingId !== null ? `Edit Release #${editingId}` : "Add new release"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Release 3"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Start date *</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">End date (optional)</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputClass} h-16`}
            />
          </div>
          {error && (
            <div className="bg-danger/10 border border-danger/40 text-danger text-sm rounded p-2">{error}</div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white text-sm px-3 py-1.5 rounded transition-colors"
            >
              {editingId !== null ? "Update" : "Add"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-surface-2 hover:bg-surface-2/80 border border-border-default text-text-secondary text-sm px-3 py-1.5 rounded transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-surface border border-border-default rounded-[10px]">
        <div className="p-4 border-b border-border-default">
          <h2 className="text-sm font-semibold text-text-primary">All Releases ({releases.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-text-secondary uppercase border-b border-border-default">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Start</th>
                <th className="text-left px-4 py-2">End</th>
                <th className="text-left px-4 py-2">Notes</th>
                <th className="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted">Loading...</td></tr>
              ) : releases.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted">No releases yet</td></tr>
              ) : (
                releases.map((r) => (
                  <tr key={r.id} className="border-b border-border-default/50 hover:bg-surface-2/40">
                    <td className="px-4 py-2 text-text-primary font-medium">{r.name}</td>
                    <td className="px-4 py-2 text-text-secondary">{r.start_date}</td>
                    <td className="px-4 py-2 text-text-secondary">{r.end_date ?? <span className="text-success">ongoing</span>}</td>
                    <td className="px-4 py-2 text-text-muted text-xs truncate max-w-xs">{r.notes ?? "-"}</td>
                    <td className="px-4 py-2 text-right space-x-3">
                      <button onClick={() => handleEdit(r)} className="text-primary hover:text-primary/80 text-xs">Edit</button>
                      <button onClick={() => handleDelete(r.id, r.name)} className="text-danger hover:text-danger/80 text-xs">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
