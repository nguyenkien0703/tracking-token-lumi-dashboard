"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { fmtInt } from "@/lib/format";
import ResponsiveTable, { type Column } from "@/components/ResponsiveTable";

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

function deptSlug(key: string): string {
  return key.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "") || "unnamed";
}

const rosterCols: Column<RosterEntry>[] = [
  {
    key: "email",
    header: "Email",
    primary: true,
    render: (r) => (
      <div className="min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{r.email}</p>
        {r.full_name && (
          <p className="text-text-secondary text-xs truncate">{r.full_name}</p>
        )}
      </div>
    ),
  },
  {
    key: "source",
    header: "Source",
    align: "right",
    mobileHidden: true,
    render: (r) => (
      <span className="text-text-muted text-xs">{r.source ?? "-"}</span>
    ),
  },
  {
    key: "added_at",
    header: "Added",
    align: "right",
    mobileHidden: true,
    render: (r) => (
      <span className="text-text-muted text-xs">
        {new Date(r.added_at).toLocaleDateString()}
      </span>
    ),
  },
];

export default function RosterSettingsPage() {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  const abortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRoster = useCallback(async (q: string = "") => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const url = q
        ? `/api/savameta/roster?search=${encodeURIComponent(q)}`
        : "/api/savameta/roster";
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error(`Roster endpoint returned ${r.status}`);
      const json = await r.json();
      if (ctrl.signal.aborted) return;
      setRoster(json.data ?? []);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load roster");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoster();
    return () => {
      abortRef.current?.abort();
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [fetchRoster]);

  const onSearchChange = (v: string) => {
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => fetchRoster(v), 250);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, RosterEntry[]>();
    for (const r of roster) {
      const key = r.department ?? "__unassigned__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries())
      .map(([key, entries]) => ({
        key,
        label: key === "__unassigned__" ? "Unassigned" : key,
        entries,
      }))
      .sort((a, b) => {
        if (a.key === "__unassigned__") return 1;
        if (b.key === "__unassigned__") return -1;
        return a.label.localeCompare(b.label);
      });
  }, [roster]);

  const toggleDept = (dept: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  const expandAll = () => setExpandedDepts(new Set(grouped.map((g) => g.key)));
  const collapseAll = () => setExpandedDepts(new Set());

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

    try {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error during import");
    }
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

    try {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error during CSV upload");
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove ${email} from roster?`)) return;
    try {
      const res = await fetch(
        `/api/savameta/roster?email=${encodeURIComponent(email)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? `Delete failed (${res.status})`);
        return;
      }
      fetchRoster(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error during delete");
    }
  };

  // Delete column injected separately so handleDelete is in scope
  const colsWithDelete: Column<RosterEntry>[] = [
    ...rosterCols,
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <button
          type="button"
          onClick={() => handleDelete(r.email)}
          aria-label={`Remove ${r.email}`}
          className="text-danger hover:text-danger/80 text-xs flex items-center gap-1 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Employee Roster</h1>
          <p className="text-sm text-text-secondary mt-1">
            Danh sách nhân sự eligible cho LumiAI adoption tracking. Dùng để compute
            "Never-joined" và Adoption rate.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchRoster(search)}
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? "Refreshing roster" : "Refresh roster"}
          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Refresh
        </button>
      </div>

      {/* Import section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-surface border border-border-default rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Paste emails (textarea)</h2>
          <p className="text-xs text-text-secondary">
            Mỗi dòng / dấu phẩy 1 email. Tên &amp; department không bắt buộc.
          </p>
          <textarea
            className="w-full h-32 bg-surface-2 border border-border-default rounded p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder={"tamnt@savameta.com\nlinhtd@savameta.com\n..."}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <button
            type="button"
            onClick={handlePasteImport}
            className="bg-primary hover:bg-primary/90 text-white text-sm px-3 py-1.5 rounded transition-colors"
          >
            Import emails
          </button>
        </section>

        <section className="bg-surface border border-border-default rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Upload CSV</h2>
          <p className="text-xs text-text-secondary">
            Header bắt buộc: <code className="text-text-primary">email</code>. Optional:{" "}
            <code>full_name</code>, <code>department</code>.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCsvUpload(file);
              e.target.value = "";
            }}
            className="text-sm text-text-primary file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
          />
          <a
            href="data:text/csv;charset=utf-8,email,full_name,department%0Atamnt@savameta.com,Tam Nguyen Thi,Product"
            download="roster-template.csv"
            className="text-xs text-primary hover:text-primary/80 underline"
          >
            Download template
          </a>
        </section>
      </div>

      {/* Banners */}
      {error && (
        <div className="bg-danger/10 border border-danger/40 text-danger text-sm rounded p-3">
          {error}
        </div>
      )}
      {importResult && (
        <div className="bg-success/10 border border-success/40 text-success text-sm rounded p-3">
          Imported: <strong>{importResult.added}</strong> added,{" "}
          <strong>{importResult.updated}</strong> updated
          {importResult.skipped.length > 0 && (
            <span>
              , <strong>{importResult.skipped.length}</strong> skipped (invalid email)
            </span>
          )}
        </div>
      )}

      {/* Roster section */}
      <section className="bg-surface border border-border-default rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-default flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-text-primary">
              Current Roster ({fmtInt(roster.length)})
            </h2>
            {!search && (
              <>
                <button
                  type="button"
                  onClick={expandAll}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Collapse all
                </button>
              </>
            )}
          </div>
          <input
            type="text"
            placeholder="Search email / name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-surface-2 border border-border-default rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-64"
          />
        </div>

        {/* Loading banner */}
        {loading && roster.length === 0 && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-text-secondary text-xs bg-surface border-b border-border-default px-3 py-2"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading…
          </div>
        )}

        {/* Accordion */}
        {roster.length === 0 && !loading ? (
          <div className="px-4 py-10 text-center text-text-muted text-sm">
            No roster entries yet
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {grouped.map((group) => {
              const isExpanded =
                expandedDepts.has(group.key) || search.length > 0;
              const slug = deptSlug(group.key);
              return (
                <div key={group.key}>
                  <button
                    type="button"
                    onClick={() => toggleDept(group.key)}
                    aria-expanded={isExpanded}
                    aria-controls={`dept-panel-${slug}`}
                    id={`dept-header-${slug}`}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        className={`w-4 h-4 text-text-secondary transition-transform ${
                          isExpanded ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                      <span className="text-text-primary text-sm font-medium">
                        {group.label}
                      </span>
                      <span className="bg-surface-2 text-text-secondary text-xs px-2 py-0.5 rounded">
                        {group.entries.length}
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div
                      role="region"
                      id={`dept-panel-${slug}`}
                      aria-labelledby={`dept-header-${slug}`}
                    >
                      <ResponsiveTable
                        columns={colsWithDelete}
                        rows={group.entries}
                        rowKey={(r) => r.email}
                        emptyState={
                          <div className="px-4 py-4 text-center text-text-muted text-xs">
                            No entries
                          </div>
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
