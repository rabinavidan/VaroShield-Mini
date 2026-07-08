import { FormEvent, useEffect, useState } from "react";
import { api, FileItem } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { createDemoFiles } from "../utils/demoData";
import { EXPOSURE_LABEL, SOURCE_META, SOURCES, SourceBadge, exposureOf, sourceMeta } from "../utils/fileMeta";

const PAGE_SIZE = 8;

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [owner, setOwner] = useState("");
  const [source, setSource] = useState("other");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");

  const [classificationFilter, setClassificationFilter] = useState("");
  const [exposureFilter, setExposureFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<number[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingPhase, setGeneratingPhase] = useState<"creating" | "scanning" | null>(null);

  async function loadFiles() {
    try {
      const result = await api.getFiles();
      setFiles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [classificationFilter, exposureFilter, ownerFilter, sourceFilter]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.createFile({ name, content, owner, source, is_public: isPublic });
      setName("");
      setContent("");
      setOwner("");
      setSource("other");
      setIsPublic(false);
      loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create file");
    }
  }

  async function generateDemoFiles() {
    setError("");
    setGenerating(true);
    setGeneratingPhase("creating");
    try {
      await createDemoFiles();

      // classification/risk only get computed by a real scan pass, so run one
      // now instead of leaving the new files stuck at "unknown".
      setGeneratingPhase("scanning");
      const job = await api.startScan();
      let status = job.status;
      while (status !== "done" && status !== "failed") {
        await new Promise((resolve) => setTimeout(resolve, 500));
        status = (await api.getScanStatus(job.job_id)).status;
      }

      loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate demo files");
    } finally {
      setGenerating(false);
      setGeneratingPhase(null);
    }
  }

  async function exposeToEveryone(fileId: number) {
    setError("");
    try {
      await api.setPermission(fileId, "everyone", "read");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update permission");
    }
  }

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
      await Promise.all(confirmDeleteIds.map((id) => api.deleteFile(id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        confirmDeleteIds.forEach((id) => next.delete(id));
        return next;
      });
      setConfirmDeleteIds(null);
      loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const classifications = Array.from(new Set(files.map((f) => f.classification))).sort();
  const owners = Array.from(new Set(files.map((f) => f.owner))).sort();
  const sourcesPresent = Array.from(new Set(files.map((f) => f.source))).sort();

  const filteredFiles = files
    .filter((f) => !classificationFilter || f.classification === classificationFilter)
    .filter((f) => !exposureFilter || exposureOf(f) === exposureFilter)
    .filter((f) => !ownerFilter || f.owner === ownerFilter)
    .filter((f) => !sourceFilter || f.source === sourceFilter)
    .sort((a, b) => b.id - a.id);

  const pageCount = Math.max(1, Math.ceil(filteredFiles.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedFiles = filteredFiles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allFilteredSelected = filteredFiles.length > 0 && filteredFiles.every((f) => selectedIds.has(f.id));
  const someFilteredSelected = filteredFiles.some((f) => selectedIds.has(f.id));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Files</h1>
          <p>Create a file, then expose it to see how the risk engine reacts.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          data-testid="create-file-name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Content"
          value={content}
          data-testid="create-file-content"
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          placeholder="Owner"
          value={owner}
          data-testid="create-file-owner"
          onChange={(e) => setOwner(e.target.value)}
        />
        <select data-testid="create-file-source" value={source} onChange={(e) => setSource(e.target.value)}>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_META[s].label}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={isPublic}
            data-testid="create-file-public"
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Public
        </label>
        <button type="submit" data-testid="create-file-submit">
          Create File
        </button>
        <button
          type="button"
          className="btn-outline"
          data-testid="generate-demo-files"
          onClick={generateDemoFiles}
          disabled={generating}
        >
          {generatingPhase === "scanning"
            ? "Scanning…"
            : generatingPhase === "creating"
            ? "Generating…"
            : "Generate 7 Demo Files"}
        </button>
      </form>

      <div className="filter-bar">
        <label>
          Classification
          <select
            data-testid="files-classification-filter"
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
          >
            <option value="">All</option>
            {classifications.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Exposure
          <select
            data-testid="files-exposure-filter"
            value={exposureFilter}
            onChange={(e) => setExposureFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="public">Public</option>
            <option value="shared">Shared</option>
            <option value="private">Private</option>
          </select>
        </label>
        <label>
          Source
          <select data-testid="files-source-filter" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="">All</option>
            {sourcesPresent.map((s) => (
              <option key={s} value={s}>
                {sourceMeta(s).label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Owner
          <select
            data-testid="files-owner-filter"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option value="">All</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="selection-bar">
        <span className="selection-count">
          {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filteredFiles.length} files`}
        </span>
        {selectedIds.size > 0 && (
          <button
            type="button"
            className="btn-danger btn-sm"
            data-testid="files-delete-selected"
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
        <table data-testid="files-table">
          <thead>
            <tr>
              <th className="select-cell">
                <input
                  type="checkbox"
                  aria-label="Select all files"
                  data-testid="files-select-all"
                  checked={allFilteredSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected;
                  }}
                  onChange={() =>
                    setSelectedIds(allFilteredSelected ? new Set() : new Set(filteredFiles.map((f) => f.id)))
                  }
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Classification</th>
              <th>Exposure</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedFiles.map((file) => {
              const exposure = exposureOf(file);
              return (
                <tr key={file.id} data-testid={`file-row-${file.id}`}>
                  <td className="select-cell">
                    <input
                      type="checkbox"
                      aria-label={`Select file ${file.id}`}
                      data-testid={`file-select-${file.id}`}
                      checked={selectedIds.has(file.id)}
                      onChange={() => toggleSelect(file.id)}
                    />
                  </td>
                  <td>{file.id}</td>
                  <td>{file.name}</td>
                  <td>
                    <SourceBadge source={file.source} />
                  </td>
                  <td>{file.owner}</td>
                  <td>
                    <span className={`badge badge-${file.classification}`}>{file.classification}</span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${exposure}`}
                      title={exposure === "shared" ? "Shared with everyone" : undefined}
                    >
                      {EXPOSURE_LABEL[exposure]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn-warning btn-sm"
                        title="Expose to everyone"
                        data-testid={`file-expose-${file.id}`}
                        onClick={() => exposeToEveryone(file.id)}
                      >
                        Expose
                      </button>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        data-testid={`file-delete-${file.id}`}
                        onClick={() => setConfirmDeleteIds([file.id])}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        totalItems={filteredFiles.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {confirmDeleteIds && (
        <ConfirmDialog
          title={confirmDeleteIds.length > 1 ? `Delete ${confirmDeleteIds.length} files?` : "Delete this file?"}
          message="This also removes its permissions and any risk alerts. This can't be undone."
          busy={deleting}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteIds(null)}
        />
      )}
    </div>
  );
}
