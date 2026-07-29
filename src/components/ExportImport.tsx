import { useState, useRef } from "react";
import type { TodoData } from "../hooks/useTodos";

interface ExportImportProps {
  data: TodoData;
  onImport: (data: TodoData) => void;
  onClose: () => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ data, onImport, onClose }) => {
  const [mode, setMode] = useState<"export" | "import">("export");
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJson = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = exportJson;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-fade-in-up"
        style={{ background: "var(--color-card)", borderColor: "var(--color-card-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--color-card-border)" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
            {mode === "export" ? "Export Data" : "Import Data"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-1 p-3" style={{ background: "var(--color-overlay)" }}>
          <button
            onClick={() => setMode("export")}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            style={{
              background: mode === "export" ? "var(--color-accent)" : "transparent",
              color: mode === "export" ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            Export
          </button>
          <button
            onClick={() => setMode("import")}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            style={{
              background: mode === "import" ? "var(--color-accent)" : "transparent",
              color: mode === "import" ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            Import
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
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
                  onClick={handleCopy}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: copied ? "var(--color-success)" : "var(--color-accent)",
                    color: "#fff",
                  }}
                >
                  {copied ? "Copied! ✓" : "Copy to Clipboard"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
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
                className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-accent"
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
                    onClick={handlePasteImport}
                    className="w-full mt-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
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
        </div>
      </div>
    </div>
  );
};

export default ExportImport;
