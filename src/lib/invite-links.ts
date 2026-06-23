const INVITE_LINK_RE = /(?:https?:\/\/)?t\.me\/\+([A-Za-z0-9]+)/i;

export function parseInviteCode(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const fromLink = value.match(INVITE_LINK_RE);
  if (fromLink?.[1]) {
    return fromLink[1];
  }

  const bareCode = value.match(/^\+?([A-Za-z0-9]{8,})$/);
  return bareCode?.[1] ?? null;
}

export function getInviteJoinPath(input: string): string | null {
  const code = parseInviteCode(input);
  return code ? `/join/${encodeURIComponent(code)}` : null;
}

export function isInviteLink(input: string): boolean {
  return parseInviteCode(input) !== null;
}

const INVITE_INLINE_RE = /(?:https?:\/\/)?t\.me\/\+[A-Za-z0-9]+/gi;

export type LinkifiedPart =
  | { type: "text"; value: string }
  | { type: "invite"; value: string };

export function linkifyInviteLinks(text: string): LinkifiedPart[] {
  const parts: LinkifiedPart[] = [];
  let lastIndex = 0;

  const re = new RegExp(INVITE_INLINE_RE.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "invite", value: match[0] });
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (parts.length === 0) {
    parts.push({ type: "text", value: text });
  }

  return parts;
}
