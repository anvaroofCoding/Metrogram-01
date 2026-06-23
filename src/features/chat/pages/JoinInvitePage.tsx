import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJoinByInviteMutation } from "@/features/chat/api/chatApi";

export function JoinInvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { mutateAsync: joinByInvite } = useJoinByInviteMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const conversation = await joinByInvite({ code: decodeURIComponent(code) });
        if (cancelled) return;

        navigate("/", {
          replace: true,
          state: { openConversationId: conversation.id },
        });
      } catch {
        if (cancelled) return;
        setError("Havola topilmadi yoki qo‘shilib bo‘lmadi");
        window.setTimeout(() => navigate("/", { replace: true }), 1800);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, joinByInvite, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center dark:bg-[#1e1e1e]">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {error ?? "Havola ochilmoqda..."}
      </p>
    </div>
  );
}
