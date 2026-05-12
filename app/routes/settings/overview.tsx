import { ArrowRight } from "lucide-react";

import Link from "~/components/link";
import PageError from "~/components/page-error";

import type { Route } from "./+types/overview";

export async function loader({ context }: Route.LoaderArgs) {
  return {
    config: context.hs.writable(),
    isOidcEnabled: context.oidc?.service.status().state === "ready",
  };
}

export default function Page({ loaderData: { config, isOidcEnabled } }: Route.ComponentProps) {
  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-8">
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">设置</h1>
        <p>
          设置页面仍在建设中。随着功能新增，将逐步在此展示。如需某项功能，欢迎在 GitHub 仓库提交 issue。
        </p>
      </div>
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">预认证密钥</h1>
        <p>
          Headscale 完全支持预认证密钥，将设备轻松添加到您的 Tailnet。如需了解更多，请参阅{" "}
          <Link external styled to="https://tailscale.com/kb/1085/auth-keys/">
            Tailscale 文档
          </Link>
        </p>
      </div>
      <Link to="/settings/auth-keys">
        <div className="flex items-center text-lg font-medium">
          管理认证密钥
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </Link>
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">Headplane 代理</h1>
        <p>
          Headplane 代理从您的 Tailnet 同步节点信息，如操作系统版本和连接详情。
        </p>
      </div>
      <Link to="/settings/agent">
        <div className="flex items-center text-lg font-medium">
          代理设置
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </Link>
      {config && isOidcEnabled ? (
        <>
          <div className="flex w-full flex-col sm:w-2/3">
            <h1 className="mb-4 text-2xl font-medium">认证限制</h1>
            <p>
              Headscale 支持限制 OIDC 认证，仅允许特定邮箱域、组或用户进行认证，限制对您 Tailnet 的访问。Headplane 也尊重这些设置。{" "}
              <Link external styled to="https://headscale.net/stable/ref/oidc/#basic-configuration">
                了解更多
              </Link>
            </p>
          </div>
          <Link to="/settings/restrictions">
            <div className="flex items-center text-lg font-medium">
              管理限制
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </>
      ) : undefined}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <PageError error={error} page="设置" />;
}
