import { useState, useRef, useEffect } from "react";
import type { TodoData } from "@/types";
import { TIMING } from "@/constants/app";
import { copyToClipboard } from "@/utils/clipboard";
import Modal from "@/components/Modal";

interface ExportImportProps {
  data: TodoData;
  onImport: (data: TodoData) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ExportImport: React.FC<ExportImportProps> = ({
  data,
  onImport,
  onClose,
  isOpen,
}) => {
  const [mode, setMode] = useState<"export" | "import">("export");
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset to export tab whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => setMode("export"), 0);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  const exportJson = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    const ok = await copyToClipboard(exportJson);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), TIMING.COPIED_FEEDBACK_MS);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      try {
        const parsed = JSON.parse(text) as TodoData;
        if (!parsed.lists || !parsed.todos) {
          setImportError("Invalid file format: missing 'lists' or 'todos'");
          return;
        }
        onImport(parsed);
        onClose();
      } catch {
        setImportError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    try {
      const parsed = JSON.parse(importJson) as TodoData;
      if (!parsed.lists || !parsed.todos) {
        setImportError("Invalid data: missing 'lists' or 'todos'");
        return;
      }
      onImport(parsed);
      onClose();
    } catch {
      setImportError("Invalid JSON format");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "export" ? "Export Data" : "Import Data"}
    >
      {/* Tab buttons */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-4"
        style={{ background: "var(--color-overlay)" }}
      >
        <button
          type="button"
          onClick={() => setMode("export")}
          className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          style={{
            background: mode === "export" ? "var(--color-accent)" : "transparent",
            color: mode === "export" ? "#fff" : "var(--color-text-secondary)",
          }}
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => setMode("import")}
          className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          style={{
            background: mode === "import" ? "var(--color-accent)" : "transparent",
            color: mode === "import" ? "#fff" : "var(--color-text-secondary)",
          }}
        >
          Import
        </button>
      </div>

      {mode === "export" ? (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Your todo data includes {data.lists.length} lists and {data.todos.length} todos.
          </p>
          <textarea
            readOnly
            value={exportJson}
            className="w-full h-40 p-3 rounded-xl text-xs font-mono focus:outline-none resize-none"
            style={{
              background: "var(--color-input-bg)",
              color: "var(--color-text)",
              border: "1px solid var(--color-input-border)",
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: copied ? "var(--color-success)" : "var(--color-accent)",
                color: "#fff",
              }}
            >
              {copied ? "Copied! ✓" : "Copy to Clipboard"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "var(--color-overlay)",
                color: "var(--color-text)",
                border: "1px solid var(--color-input-border)",
              }}
            >
              Download .json
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Paste JSON or upload a file to restore your todos. This will replace all current data.
          </p>

          {/* File upload */}
          <div
            className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-[var(--color-accent)]"
            style={{ borderColor: "var(--color-input-border)" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--color-text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Click to upload a .json file
              </p>
            </div>
          </div>

          {/* Or paste */}
          <div className="relative">
            <textarea
              value={importJson}
              onChange={(e) => { setImportJson(e.target.value); setImportError(""); }}
              placeholder="...or paste JSON here"
              className="w-full h-28 p-3 rounded-xl text-xs font-mono focus:outline-none resize-none"
              style={{
                background: "var(--color-input-bg)",
                color: "var(--color-text)",
                border: `1px solid ${importError ? "var(--color-danger)" : "var(--color-input-border)"}`,
              }}
            />
            {importJson && (
              <button
                type="button"
                onClick={handlePasteImport}
                className="w-full mt-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "var(--color-accent)",
                  color: "#fff",
                }}
              >
                Import
              </button>
            )}
          </div>

          {importError && (
            <p className="text-xs font-medium" style={{ color: "var(--color-danger)" }}>
              {importError}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ExportImport;
