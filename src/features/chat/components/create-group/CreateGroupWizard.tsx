import { useState } from "react";
import { useCreateGroupMutation } from "@/features/chat/api/chatApi";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";
import { AddMembersStep } from "./AddMembersStep";
import { NewGroupFormStep, type GroupFormData } from "./NewGroupFormStep";
import { groupVisibilityToIsPublic } from "./GroupTypeSelector";

type WizardStep = "form" | "members";

interface CreateGroupWizardProps {
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
  className?: string;
}

const INITIAL_FORM: GroupFormData = {
  title: "",
  visibility: "private",
};

export function CreateGroupWizard({ onClose, onCreated, className }: CreateGroupWizardProps) {
  const [step, setStep] = useState<WizardStep>("form");
  const [formData, setFormData] = useState<GroupFormData>(INITIAL_FORM);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { mutateAsync: createGroup, isLoading } = useCreateGroupMutation();

  const handleCreate = async () => {
    try {
      const conversation = await createGroup({
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        avatarUrl: formData.avatarUrl,
        memberIds: selectedIds,
        isPublic: groupVisibilityToIsPublic(formData.visibility),
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
        <NewGroupFormStep
          data={formData}
          onChange={setFormData}
          onBack={onClose}
          onNext={() => setStep("members")}
        />
      ) : (
        <AddMembersStep
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
