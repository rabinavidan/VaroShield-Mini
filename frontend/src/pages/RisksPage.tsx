import { useEffect, useState } from "react";
import { api, RiskAlert } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 8;

// The only values risk_service.py ever produces — kept static (not derived
// from the loaded list) so the filters are always immediately selectable,
// instead of appearing only after the async fetch resolves.
const SEVERITIES = ["high", "low"];
const STATUSES = ["open", "resolved"];
const SEVERITY_LEVEL: Record<string, number> = { high: 3, medium: 2, low: 1 };

function SeverityBars({ severity }: { severity: string }) {
  const level = SEVERITY_LEVEL[severity] ?? 0;
  return (
    <span className={`severity-bars severity-bars--${severity}`} aria-hidden="true">
      {[1, 2, 3].map((bar) => (
        <span key={bar} className={bar <= level ? "severity-bar severity-bar--filled" : "severity-bar"} />
      ))}
    </span>
  );
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatJson(value: unknown): string {
  const json = escapeHtml(JSON.stringify(value, null, 2));
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "json-key" : "json-string";
      } else if (match === "true" || match === "false") {
        cls = "json-boolean";
      } else if (match === "null") {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function RiskDetailDrawer({
  risk,
  onClose,
  onResolved,
  onRequestDelete,
}: {
  risk: RiskAlert;
  onClose: () => void;
  onResolved: () => void;
  onRequestDelete: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "log">("overview");
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleResolve() {
    setError("");
    setResolving(true);
    try {
      await api.resolveRisk(risk.id);
      onResolved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve");
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <p className="flow-eyebrow">Risk alert #{risk.id}</p>
            <h2>File {risk.file_id}</h2>
          </div>
          <button type="button" className="btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="drawer-tabs">
          <button
            type="button"
            className={tab === "overview" ? "drawer-tab drawer-tab--active" : "drawer-tab"}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={tab === "log" ? "drawer-tab drawer-tab--active" : "drawer-tab"}
            onClick={() => setTab("log")}
          >
            Log
          </button>
        </div>

        {tab === "overview" ? (
          <div className="drawer-overview">
            <div className="drawer-field">
              <span>Severity</span>
              <span className={`badge badge-severity-${risk.severity}`}>{risk.severity}</span>
            </div>
            <div className="drawer-field">
              <span>Status</span>
              <span className={`badge badge-status-${risk.status}`}>{risk.status}</span>
            </div>
            <div className="drawer-field">
              <span>Reason</span>
              <span>{risk.reason}</span>
            </div>
            <div className="drawer-field">
              <span>Created</span>
              <span>{new Date(risk.created_at).toLocaleString()}</span>
            </div>

            {error && <p className="error">{error}</p>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {risk.status === "open" && (
                <button type="button" className="btn-warning" onClick={handleResolve} disabled={resolving}>
                  {resolving ? "Resolving…" : "Mark resolved"}
                </button>
              )}
              <button type="button" className="btn-danger" onClick={onRequestDelete}>
                Delete
              </button>
            </div>
          </div>
        ) : (
          <pre className="log-viewer" dangerouslySetInnerHTML={{ __html: formatJson(risk) }} />
        )}
      </aside>
    </div>
  );
}

export default function RisksPage() {
  const [risks, setRisks] = useState<RiskAlert[]>([]);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [selectedRiskId, setSelectedRiskId] = useState<number | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<number[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadRisks() {
    try {
      const result = await api.getRisks();
      setRisks(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load risks");
    }
  }

  useEffect(() => {
    loadRisks();
  }, []);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [severity, status]);

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDeleteConfirmed() {
    if (!confirmDeleteIds) return;
    setDeleting(true);
    setError("");
    try {
      await Promise.all(confirmDeleteIds.map((id) => api.deleteRisk(id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        confirmDeleteIds.forEach((id) => next.delete(id));
        return next;
      });
      setConfirmDeleteIds(null);
      if (selectedRiskId !== null && confirmDeleteIds.includes(selectedRiskId)) {
        setSelectedRiskId(null);
      }
      loadRisks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const filteredRisks = risks
    .filter((r) => !severity || r.severity === severity)
    .filter((r) => !status || r.status === status)
    .sort((a, b) => b.id - a.id);

  const pageCount = Math.max(1, Math.ceil(filteredRisks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRisks = filteredRisks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedRisk = risks.find((r) => r.id === selectedRiskId) || null;
  const allFilteredSelected = filteredRisks.length > 0 && filteredRisks.every((r) => selectedIds.has(r.id));
  const someFilteredSelected = filteredRisks.some((r) => selectedIds.has(r.id));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Risks</h1>
          <p>Every open alert, with the rule that raised it.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="filter-bar">
        <label>
          Severity
          <select data-testid="severity-filter" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select data-testid="status-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="selection-bar">
        <span className="selection-count">
          {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filteredRisks.length} alerts`}
        </span>
        {selectedIds.size > 0 && (
          <button
            type="button"
            className="btn-danger btn-sm"
            data-testid="risks-delete-selected"
            onClick={() => setConfirmDeleteIds(Array.from(selectedIds))}
          >
            Delete selected ({selectedIds.size})
          </button>
        )}
      </div>

      <div className="table-card">
        <div className="window-chrome">
          <span />
          <span />
          <span />
        </div>
        <table data-testid="risks-table">
          <thead>
            <tr>
              <th className="select-cell">
                <input
                  type="checkbox"
                  aria-label="Select all risks"
                  checked={allFilteredSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected;
                  }}
                  onChange={() =>
                    setSelectedIds(allFilteredSelected ? new Set() : new Set(filteredRisks.map((r) => r.id)))
                  }
                />
              </th>
              <th>File ID</th>
              <th>Severity</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedRisks.map((risk) => (
              <tr key={risk.id} className="table-row-clickable" onClick={() => setSelectedRiskId(risk.id)}>
                <td className="select-cell" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label={`Select risk ${risk.id}`}
                    checked={selectedIds.has(risk.id)}
                    onChange={() => toggleSelect(risk.id)}
                  />
                </td>
                <td>{risk.file_id}</td>
                <td>
                  <span className="severity-cell">
                    <SeverityBars severity={risk.severity} />
                    <span className={`badge badge-severity-${risk.severity}`}>{risk.severity}</span>
                  </span>
                </td>
                <td>{risk.reason}</td>
                <td>
                  <span className={`badge badge-status-${risk.status}`}>{risk.status}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={() => setConfirmDeleteIds([risk.id])}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        totalItems={filteredRisks.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {selectedRisk && !confirmDeleteIds && (
        <RiskDetailDrawer
          risk={selectedRisk}
          onClose={() => setSelectedRiskId(null)}
          onResolved={() => {
            setSelectedRiskId(null);
            loadRisks();
          }}
          onRequestDelete={() => setConfirmDeleteIds([selectedRisk.id])}
        />
      )}

      {confirmDeleteIds && (
        <ConfirmDialog
          title={confirmDeleteIds.length > 1 ? `Delete ${confirmDeleteIds.length} alerts?` : "Delete this alert?"}
          message="This removes the alert from the list. This can't be undone."
          busy={deleting}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteIds(null)}
        />
      )}
    </div>
  );
}
