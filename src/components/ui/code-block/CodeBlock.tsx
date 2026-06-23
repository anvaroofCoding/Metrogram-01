import "./code-block.css";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, IconCheck, IconCopy } from "@/components/icons";
import { cn } from "@/lib/utils";
import { hljs } from "./hljs-setup";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

function highlightCode(code: string, language: string): string {
  if (!code) {
    return "";
  }

  const normalized = language.toLowerCase();

  if (normalized && normalized !== "text" && hljs.getLanguage(normalized)) {
    return hljs.highlight(code, { language: normalized }).value;
  }

  return hljs.highlightAuto(code).value;
}

export function CodeBlock({ code, language = "text", className }: CodeBlockProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const highlighted = useMemo(() => highlightCode(code, language), [code, language]);
  const displayLanguage = language.trim() || "text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("code-block", className)}>
      <div className="code-block-header">
        <span className="code-block-lang">{displayLanguage}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="code-block-copy"
          aria-label={copied ? t("common.copied") : t("common.copy")}
          title={copied ? t("common.copied") : t("common.copy")}
        >
          <Icon icon={copied ? IconCheck : IconCopy} size={16} />
        </button>
      </div>
      <pre className="code-block-body">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}
