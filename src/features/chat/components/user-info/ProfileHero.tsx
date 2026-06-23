import { AvatarLightboxTrigger } from "@/components/ui/avatar-lightbox-trigger";
import { useDisplayConversation } from "@/features/chat/hooks/useDisplayConversation";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";
import { ChatAvatar } from "../sidebar/ChatAvatar";

interface ProfileHeroProps {
  conversation: Conversation;
  subtitle: string;
}

export function ProfileHero({ conversation, subtitle }: ProfileHeroProps) {
  const display = useDisplayConversation(conversation);

  return (
    <div className="flex flex-col items-center px-4 pb-4 pt-2">
      <AvatarLightboxTrigger avatarUrl={display.avatarUrl} name={display.title}>
        <ChatAvatar conversation={display} size="xl" />
      </AvatarLightboxTrigger>
      <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
        {display.title}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
    </div>
  );
}

interface InfoCardProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoCard({ children, className }: InfoCardProps) {
  return (
    <div
      className={cn(
        "mx-3 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#2a2a2a] dark:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
