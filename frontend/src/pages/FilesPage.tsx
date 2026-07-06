import { FormEvent, useEffect, useState } from "react";
import { api, FileItem } from "../api/client";

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [owner, setOwner] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.createFile({ name, content, owner, is_public: isPublic });
      setName("");
      setContent("");
      setOwner("");
      setIsPublic(false);
      loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create file");
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

  return (
    <div className="page">
      <h1>Files</h1>
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
      </form>

      <table data-testid="files-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Owner</th>
            <th>Classification</th>
            <th>Public</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.id}</td>
              <td>{file.name}</td>
              <td>{file.owner}</td>
              <td>{file.classification}</td>
              <td>{file.is_public ? "yes" : "no"}</td>
              <td>
                <button onClick={() => exposeToEveryone(file.id)}>
                  Expose to Everyone
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
