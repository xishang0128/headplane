import { Building2, House } from "lucide-react";

import Link from "~/components/link";
import cn from "~/utils/cn";

import CreateUser from "../dialogs/create-user";

interface ManageBannerProps {
  oidc?: { issuer: string; loginServer: string };
  isDisabled?: boolean;
}

export default function ManageBanner({ oidc, isDisabled }: ManageBannerProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        "rounded-lg border border-mist-200 p-4 dark:border-mist-800",
      )}
    >
      <div className="flex items-center gap-3">
        {oidc ? <Building2 className="h-5 w-5 shrink-0" /> : <House className="h-5 w-5 shrink-0" />}
        <p className="text-sm text-mist-600 dark:text-mist-300">
          {oidc ? (
            <>
              用户通过您的{" "}
              <Link external styled to={oidc.issuer}>
                OIDC 提供商
              </Link>
              管理。请让用户运行{" "}
              <code className="rounded bg-mist-100 px-1.5 py-0.5 text-xs dark:bg-mist-800">
                tailscale up --login-server={oidc.loginServer}
              </code>{" "}
              完成 Headscale OIDC 注册登录。
            </>
          ) : (
            <>
              用户在本地管理。{" "}
              <Link styled to="https://headscale.net/stable/ref/oidc">
                设置 OIDC
              </Link>
            </>
          )}
        </p>
      </div>
      {!oidc && <CreateUser isDisabled={isDisabled} />}
    </div>
  );
}
