import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export function TailscaleSSHTag() {
  return (
    <Tooltip content="此机器广播了 Tailscale SSH，您可以使用 Tailscale 账户认证 SSH 凭证，并通过 Headplane Web 界面进行 SSH。">
      <Chip
        text="Tailscale SSH"
        className={cn("bg-lime-500 text-lime-900 dark:bg-lime-900 dark:text-lime-500")}
      />
    </Tooltip>
  );
}
