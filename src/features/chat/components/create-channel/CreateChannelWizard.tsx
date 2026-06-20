import { useState } from "react";
import { useCreateChannelMutation } from "@/features/chat/api/chatApi";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";
import { AddSubscribersStep } from "./AddSubscribersStep";
import { NewChannelFormStep, type ChannelFormData } from "./NewChannelFormStep";

type WizardStep = "form" | "subscribers";

interface CreateChannelWizardProps {
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
  className?: string;
}

const INITIAL_FORM: ChannelFormData = {
  title: "",
  description: "",
};

export function CreateChannelWizard({ onClose, onCreated, className }: CreateChannelWizardProps) {
  const [step, setStep] = useState<WizardStep>("form");
  const [formData, setFormData] = useState<ChannelFormData>(INITIAL_FORM);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { mutateAsync: createChannel, isLoading } = useCreateChannelMutation();

  const handleCreate = async () => {
    try {
      const conversation = await createChannel({
        title: formData.title,
        description: formData.description || undefined,
        avatarUrl: formData.avatarUrl,
        memberIds: selectedIds,
      });
      onCreated(conversation);
    } catch {
      // mutation error handled by hook
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[28px] bg-white dark:bg-[#1e1e1e]",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        className,
      )}
    >
      {step === "form" ? (
        <NewChannelFormStep
          data={formData}
          onChange={setFormData}
          onBack={onClose}
          onNext={() => setStep("subscribers")}
        />
      ) : (
        <AddSubscribersStep
          channelName={formData.title.trim()}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onBack={() => setStep("form")}
          onCreate={handleCreate}
          isCreating={isLoading}
        />
      )}
    </div>
  );
}
