"use client";

import { useCallback, useEffect, useState } from "react";

type RosterEntry = {
  email: string;
  full_name: string | null;
  department: string | null;
  source: string | null;
  added_at: string;
  added_by: string | null;
};

type ImportResult = {
  added: number;
  updated: number;
  skipped: { email: string; reason: string }[];
};

export default function RosterSettingsPage() {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRoster = useCallback(async (q: string = "") => {
    setLoading(true);
    try {
      const url = q ? `/api/savameta/roster?search=${encodeURIComponent(q)}` : "/api/savameta/roster";
      const res = await fetch(url);
      const json = await res.json();
      setRoster(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const handlePasteImport = async () => {
    setError(null);
    setImportResult(null);

    const emails = pasteText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      setError("Paste at least one email");
      return;
    }

    const entries = emails.map((email) => ({ email }));

    const res = await fetch("/api/savameta/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries, source: "textarea" }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Import failed");
      return;
    }

    setImportResult(json);
    setPasteText("");
    fetchRoster(search);
  };

  const handleCsvUpload = async (file: File) => {
    setError(null);
    setImportResult(null);

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      setError("CSV must have header + at least 1 row");
      return;
    }

    const header = lines[0].split(",").map((s) => s.trim().toLowerCase());
    const emailIdx = header.indexOf("email");
    const nameIdx = header.indexOf("full_name");
    const deptIdx = header.indexOf("department");

    if (emailIdx === -1) {
      setError("CSV header must include 'email'");
      return;
    }

    const entries = lines.slice(1).map((line) => {
      const cols = line.split(",").map((s) => s.trim());
      return {
        email: cols[emailIdx],
        full_name: nameIdx >= 0 ? cols[nameIdx] : undefined,
        department: deptIdx >= 0 ? cols[deptIdx] : undefined,
      };
    });

    const res = await fetch("/api/savameta/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries, source: "csv_upload" }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "CSV import failed");
      return;
    }

    setImportResult(json);
    fetchRoster(search);
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove ${email} from roster?`)) return;
    await fetch(`/api/savameta/roster?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    fetchRoster(search);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Employee Roster</h1>
        <p className="text-sm text-slate-400 mt-1">
          Danh sách nhân sự eligible cho LumiAI adoption tracking. Dùng để compute "Never-joined" và Adoption rate.
        </p>
      </div>

      {/* Import section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Paste emails (textarea)</h2>
          <p className="text-xs text-slate-400">Mỗi dòng / dấu phẩy 1 email. Tên & department không bắt buộc.</p>
          <textarea
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder={"tamnt@savameta.com\nlinhtd@savameta.com\n..."}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <button
            onClick={handlePasteImport}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-1.5 rounded transition-colors"
          >
            Import emails
          </button>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Upload CSV</h2>
          <p className="text-xs text-slate-400">
            Header bắt buộc: <code className="text-slate-300">email</code>. Optional: <code>full_name</code>, <code>department</code>.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCsvUpload(file);
              e.target.value = "";
            }}
            className="text-sm text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer"
          />
          <a
            href="data:text/csv;charset=utf-8,email,full_name,department%0Atamnt@savameta.com,Tam Nguyen Thi,Product"
            download="roster-template.csv"
            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
          >
            Download template
          </a>
        </section>
      </div>

      {/* Result banner */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 text-sm rounded p-3">{error}</div>
      )}
      {importResult && (
        <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-200 text-sm rounded p-3">
          Imported: <strong>{importResult.added}</strong> added, <strong>{importResult.updated}</strong> updated
          {importResult.skipped.length > 0 && (
            <span>, <strong>{importResult.skipped.length}</strong> skipped (invalid email)</span>
          )}
        </div>
      )}

      {/* Roster list */}
      <section className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-200">
            Current Roster ({roster.length})
          </h2>
          <input
            type="text"
            placeholder="Search email / name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchRoster(e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Full Name</th>
                <th className="text-left px-4 py-2">Department</th>
                <th className="text-left px-4 py-2">Source</th>
                <th className="text-left px-4 py-2">Added</th>
                <th className="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
              ) : roster.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No roster entries yet</td></tr>
              ) : (
                roster.map((r) => (
                  <tr key={r.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-4 py-2 text-slate-200">{r.email}</td>
                    <td className="px-4 py-2 text-slate-300">{r.full_name ?? "-"}</td>
                    <td className="px-4 py-2 text-slate-300">{r.department ?? "-"}</td>
                    <td className="px-4 py-2 text-slate-400 text-xs">{r.source ?? "-"}</td>
                    <td className="px-4 py-2 text-slate-400 text-xs">{new Date(r.added_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDelete(r.email)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
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
