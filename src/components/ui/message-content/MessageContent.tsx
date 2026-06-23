import { LinkifiedMessageText } from "@/components/ui/message-content/LinkifiedMessageText";
import { CodeBlock } from "@/components/ui/code-block/CodeBlock";
import {
  hasCodeBlocks,
  isCodeOnlyMessage,
  parseMessageContent,
} from "@/lib/parse-message-content";

interface MessageContentProps {
  text: string;
  emojiSize?: number;
}

export function MessageContent({ text, emojiSize = 20 }: MessageContentProps) {
  if (!hasCodeBlocks(text)) {
    return <LinkifiedMessageText text={text} emojiSize={emojiSize} />;
  }

  const segments = parseMessageContent(text);
  const codeOnly = isCodeOnlyMessage(text);

  return (
    <div className={codeOnly ? "flex w-full flex-col" : "flex w-full flex-col gap-2"}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          if (!segment.content.trim()) {
            return null;
          }

          return (
            <LinkifiedMessageText
              key={`text-${index}`}
              text={segment.content}
              emojiSize={emojiSize}
            />
          );
        }

        return (
          <CodeBlock
            key={`code-${index}`}
            language={segment.language}
            code={segment.content}
          />
        );
      })}
    </div>
  );
}
