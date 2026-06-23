export type MessageSegment =
  | { type: "text"; content: string }
  | { type: "code"; language: string; content: string };

const FENCED_CODE_RE = /```([\s\S]*?)```/g;

function parseFencedInner(inner: string): { language: string; content: string } {
  if (!inner.includes("\n")) {
    return { language: "text", content: inner };
  }

  const firstNewline = inner.indexOf("\n");
  const firstLine = inner.slice(0, firstNewline);
  const rest = inner.slice(firstNewline + 1);

  if (/^[a-zA-Z0-9+#.-]+$/.test(firstLine)) {
    return { language: firstLine, content: rest.replace(/\n$/, "") };
  }

  return { language: "text", content: inner.replace(/^\n/, "").replace(/\n$/, "") };
}

export function parseMessageContent(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;

  const re = new RegExp(FENCED_CODE_RE.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      if (textContent) {
        segments.push({ type: "text", content: textContent });
      }
    }

    const { language, content } = parseFencedInner(match[1]);
    segments.push({ type: "code", language, content });
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}

export function hasCodeBlocks(text: string): boolean {
  return /```[\s\S]*?```/.test(text);
}

export function isCodeOnlyMessage(text: string): boolean {
  const segments = parseMessageContent(text);
  return (
    segments.length > 0 &&
    segments.every(
      (segment) => segment.type === "code" || (segment.type === "text" && !segment.content.trim()),
    ) &&
    segments.some((segment) => segment.type === "code")
  );
}

/** Chat ro'yxati va qidiruv uchun kod bloklarini oddiy matnga aylantiradi */
export function formatMessagePreview(text: string): string {
  if (!hasCodeBlocks(text)) {
    return text;
  }

  const parts: string[] = [];

  for (const segment of parseMessageContent(text)) {
    if (segment.type === "text") {
      const trimmed = segment.content.replace(/\s+/g, " ").trim();
      if (trimmed) {
        parts.push(trimmed);
      }
      continue;
    }

    const codePreview = segment.content.replace(/\s+/g, " ").trim();
    if (codePreview) {
      parts.push(codePreview);
    } else if (segment.language !== "text") {
      parts.push(segment.language);
    } else {
      parts.push("Kod");
    }
  }

  const preview = parts.join(" ").trim();
  return preview || text;
}
