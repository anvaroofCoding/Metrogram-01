import { Link } from "react-router-dom";
import { Icon, IconLink, IconQrCode } from "@/components/icons";
import { getInviteJoinPath } from "@/lib/invite-links";

interface InviteLinkRowProps {
  inviteLink: string;
  label: string;
}

export function InviteLinkRow({ inviteLink, label }: InviteLinkRowProps) {
  const joinPath = getInviteJoinPath(inviteLink);

  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-700">
      <Icon icon={IconLink} size={22} className="shrink-0 text-zinc-400" />
      <div className="min-w-0 flex-1">
        {joinPath ? (
          <Link
            to={joinPath}
            className="block truncate text-[15px] text-[#00bbff] hover:underline"
          >
            {inviteLink}
          </Link>
        ) : (
          <span className="block truncate text-[15px] text-zinc-500">{inviteLink}</span>
        )}
        <p className="text-xs text-zinc-400">{label}</p>
      </div>
      <Icon icon={IconQrCode} size={22} className="shrink-0 text-zinc-400" />
    </div>
  );
}
