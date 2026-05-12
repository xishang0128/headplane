import { data } from "react-router";

import Link from "~/components/link";
import Notice from "~/components/notice";
import { Capabilities } from "~/server/web/roles";

import type { Route } from "./+types/overview";
import { restrictionAction } from "./actions";
import AddDomain from "./dialogs/add-domain";
import AddGroup from "./dialogs/add-group";
import AddUser from "./dialogs/add-user";
import RestrictionTable from "./table";

export async function loader({ request, context }: Route.LoaderArgs) {
  const principal = await context.auth.require(request);
  const check = context.auth.can(principal, Capabilities.read_users);
  if (!check) {
    throw data("You do not have permission to view IAM settings.", {
      status: 403,
    });
  }

  if (!context.hs.c?.oidc) {
    throw data("OIDC is not configured on this Headscale instance.", {
      status: 501,
    });
  }

  return {
    access: context.auth.can(principal, Capabilities.configure_iam),
    settings: {
      domains: [...new Set(context.hs.c.oidc.allowed_domains)],
      groups: [...new Set(context.hs.c.oidc.allowed_groups)],
      users: [...new Set(context.hs.c.oidc.allowed_users)],
    },
    writable: context.hs.writable(),
  };
}

export const action = restrictionAction;

export default function Page({ loaderData: { access, writable, settings } }: Route.ComponentProps) {
  const isDisabled = writable ? !access : true;

  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-4">
      <div className="flex w-full flex-col sm:w-2/3">
        <p className="text-md mb-4">
          <Link className="font-medium" to="/settings">
            设置
          </Link>
          <span className="mx-2">/</span> 认证限制
        </p>
        {!access ? (
          <Notice title="认证权限受限" variant="warning">
            您没有编辑认证限制设置的权限。请联系管理员申请访问权限或请其进行更改。
          </Notice>
        ) : !writable ? (
          <Notice title="配置已锁定" variant="error">
            Headscale 配置文件无法通过 Web 界面进行编辑。请确保已正确授予 Headplane 对该文件的写入权限。
          </Notice>
        ) : undefined}
        <h1 className="mt-4 mb-2 text-2xl font-medium">认证限制</h1>
        <p>
          Headscale 支持将 OIDC 认证限制为仅允许特定邮箱域、组或用户登录。这可用于限制对您 Tailnet 的访问，Headplane 也尊重这些设置。{" "}
          <Link external styled to="https://headscale.net/stable/ref/oidc/#basic-configuration">
            了解更多
          </Link>
        </p>
      </div>
      <RestrictionTable isDisabled={isDisabled} type="domain" values={settings.domains}>
        <AddDomain domains={settings.domains} isDisabled={isDisabled} />
      </RestrictionTable>
      <RestrictionTable isDisabled={isDisabled} type="group" values={settings.groups}>
        <AddGroup groups={settings.groups} isDisabled={isDisabled} />
      </RestrictionTable>
      <RestrictionTable isDisabled={isDisabled} type="user" values={settings.users}>
        <AddUser isDisabled={isDisabled} users={settings.users} />
      </RestrictionTable>
    </div>
  );
}
