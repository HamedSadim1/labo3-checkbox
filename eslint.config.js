import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { importX } from "eslint-plugin-import-x";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "src");
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs"];

// Custom inline resolver for @/ path aliases
// Avoids the peer dependency conflict of eslint-import-resolver-alias
const resolveAlias = {
  interfaceVersion: 2,
  name: "alias",
  resolve: (modulePath, sourceFile) => {
    if (modulePath.startsWith("@/")) {
      const basePath = path.join(srcDir, modulePath.slice(2));
      // Try with each extension (skip bare path to avoid matching directories)
      for (const ext of EXTENSIONS) {
        const withExt = basePath + ext;
        if (fs.existsSync(withExt)) {
          return { found: true, path: withExt };
        }
      }
      // Try index files (e.g. "@/utils" → "src/utils/index.ts")
      for (const ext of EXTENSIONS) {
        const indexFile = path.join(basePath, `index${ext}`);
        if (fs.existsSync(indexFile)) {
          return { found: true, path: indexFile };
        }
      }
    }
    return { found: false };
  },
};

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "import-x": importX,
    },
    settings: {
      "import-x/resolver-next": [resolveAlias],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "import-x/no-unresolved": "error",
    },
  }
);
