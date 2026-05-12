import { FileKey2 } from "lucide-react";
import { useMemo, useState } from "react";

import Code from "~/components/code";
import Link from "~/components/link";
import Notice from "~/components/notice";
import Select from "~/components/select";
import TableList from "~/components/table-list";
import { usersResource } from "~/server/headscale/live-store";
import { Capabilities } from "~/server/web/roles";
import type { PreAuthKey } from "~/types";
import type { User } from "~/types/User";
import log from "~/utils/log";
import { getUserDisplayName } from "~/utils/user";

import type { Route } from "./+types/overview";
import { authKeysAction } from "./actions";
import AuthKeyRow from "./auth-key-row";
import AddAuthKey from "./dialogs/add-auth-key";

export async function loader({ request, context }: Route.LoaderArgs) {
  const principal = await context.auth.require(request);
  const apiKey = context.auth.getHeadscaleApiKey(principal);
  const api = context.hsApi.getRuntimeClient(apiKey);

  const usersSnap = await context.hsLive.get(usersResource, api);
  const users = usersSnap.data;

  let keys: { user: User | null; preAuthKeys: PreAuthKey[] }[];
  let missing: { user: User; error: unknown }[] = [];

  // Try fetching all keys at once (Headscale 0.28+), fall back to per-user
  let allKeys: PreAuthKey[] | null = null;
  try {
    allKeys = await api.getAllPreAuthKeys();
  } catch {
    // Older versions don't support this endpoint
  }

  if (allKeys !== null) {
    const keysByUser = new Map<string | null, PreAuthKey[]>();
    for (const key of allKeys) {
      const userId = key.user?.id ?? null;
      const existing = keysByUser.get(userId) ?? [];
      existing.push(key);
      keysByUser.set(userId, existing);
    }

    keys = [];
    const tagOnly = keysByUser.get(null);
    if (tagOnly?.length) {
      keys.push({ preAuthKeys: tagOnly, user: null });
    }
    for (const user of users) {
      const userKeys = keysByUser.get(user.id);
      if (userKeys?.length) {
        keys.push({ preAuthKeys: userKeys, user });
      }
    }
  } else {
    type FetchResult =
      | { success: true; user: User; preAuthKeys: PreAuthKey[] }
      | { success: false; user: User; error: unknown; preAuthKeys: [] };

    const results: FetchResult[] = await Promise.all(
      users
        .filter((u) => u.id?.length > 0)
        .map(async (user) => {
          try {
            const preAuthKeys = await api.getPreAuthKeys(user.id);
            return { preAuthKeys, success: true as const, user };
          } catch (error) {
            log.error("api", "GET /v1/preauthkey for %s: %o", user.name, error);
            return { error, preAuthKeys: [] as const, success: false as const, user };
          }
        }),
    );

    keys = results
      .filter(({ success }) => success)
      .map(({ user, preAuthKeys }) => ({ preAuthKeys, user }));

    missing = results
      .filter((r): r is Extract<FetchResult, { success: false }> => !r.success)
      .map(({ user, error }) => ({ error, user }));
  }

  const canGenerateAny = context.auth.can(principal, Capabilities.generate_authkeys);
  const canGenerateOwn = context.auth.can(principal, Capabilities.generate_own_authkeys);

  return {
    access: canGenerateAny || canGenerateOwn,
    currentSubject: principal.kind === "oidc" ? principal.user.subject : undefined,
    keys,
    missing,
    selfServiceOnly: !canGenerateAny && canGenerateOwn,
    url: context.config.headscale.public_url ?? context.config.headscale.url,
    users,
  };
}

export const action = authKeysAction;

type Status = "all" | "active" | "expired" | "reusable" | "ephemeral";
export default function Page({
  loaderData: { keys, missing, users, url, access, selfServiceOnly, currentSubject },
}: Route.ComponentProps) {
  const [selectedUser, setSelectedUser] = useState("__headplane_all");
  const [status, setStatus] = useState<Status>("active");
  const isDisabled = !access || keys.flatMap(({ preAuthKeys }) => preAuthKeys).length === 0;

  const filteredKeys = useMemo(() => {
    const now = new Date();
    return keys
      .filter(({ user }) => {
        if (selectedUser === "__headplane_all") {
          return true;
        }

        if (selectedUser === "__headplane_tag_only") {
          return user === null;
        }

        return user?.id === selectedUser;
      })
      .flatMap(({ preAuthKeys }) => preAuthKeys)
      .filter((key) => {
        if (status === "all") {
          return true;
        }

        if (status === "ephemeral") {
          return key.ephemeral;
        }

        if (status === "reusable") {
          return key.reusable;
        }

        const expiry = new Date(key.expiration);
        if (status === "expired") {
          // Expired keys are either used or expired
          // BUT only used if they are not reusable
          if (key.used && !key.reusable) {
            return true;
          }

          return expiry < now;
        }

        if (status === "active") {
          // Active keys are either not expired or reusable
          if (expiry < now) {
            return false;
          }

          if (!key.used) {
            return true;
          }

          return key.reusable;
        }

        return false;
      });
  }, [keys, selectedUser, status]);

  return (
    <div className="flex flex-col md:w-2/3">
      <p className="text-md mb-8">
        <Link className="font-medium" to="/settings">
          设置
        </Link>
        <span className="mx-2">/</span> 预认证密钥
      </p>
      {!access ? (
        <Notice title="预认证密钥权限受限" variant="warning">
          您没有生成预认证密钥的权限。请联系管理员申请访问权限或请其为您生成预认证密钥。
        </Notice>
      ) : missing.length > 0 ? (
        <Notice title="认证密钥读取失败" variant="error">
          读取以下用户的认证密钥时出错：{" "}
          {missing.map(({ user }, index) => (
            <>
              <Code key={user.id}>{getUserDisplayName(user)}</Code>
              {index < missing.length - 1 ? ", " : ". "}
            </>
          ))}
          其密钥可能未正确列出。请查看服务器日志以获取更多信息。
        </Notice>
      ) : undefined}
      <h1 className="mb-2 text-2xl font-medium">预认证密钥</h1>
      <p className="mb-4">
        Headscale 完全支持预认证密钥，将设备轻松添加到您的 Tailnet。如需了解更多，请参阅{" "}
        <Link external styled to="https://tailscale.com/kb/1085/auth-keys/">
          Tailscale 文档
        </Link>
      </p>
      <AddAuthKey
        currentSubject={currentSubject}
        selfServiceOnly={selfServiceOnly}
        url={url}
        users={users}
      />
      <div className="mt-4 flex items-center gap-4">
        <Select
          className="w-full"
          defaultValue="__headplane_all"
          disabled={isDisabled}
          label="用户"
          onValueChange={(value) => setSelectedUser(value ?? "")}
          placeholder="选择用户"
          items={[
            { value: "__headplane_all", label: "全部" },
            ...keys
              .filter((k): k is { user: User; preAuthKeys: PreAuthKey[] } => k.user !== null)
              .map(({ user }) => ({ value: user.id, label: getUserDisplayName(user) })),
            ...(keys.some(({ user }) => user === null)
              ? [{ value: "__headplane_tag_only", label: "仅标签" }]
              : []),
          ]}
        />
        <Select
          className="w-full"
          defaultValue="active"
          disabled={isDisabled}
          label="状态"
          onValueChange={(value) => setStatus((value ?? "active") as Status)}
          placeholder="选择状态"
          items={[
            { value: "all", label: "全部" },
            { value: "active", label: "活跃" },
            { value: "expired", label: "已使用/已过期" },
            { value: "reusable", label: "可复用" },
            { value: "ephemeral", label: "临时" },
          ]}
        />
      </div>
      <TableList className="mt-4">
        {keys.flatMap(({ preAuthKeys }) => preAuthKeys).length === 0 ? (
          <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
            <FileKey2 />
            <p className="font-semibold">尚未创建任何预认证密钥。</p>
          </TableList.Item>
        ) : filteredKeys.length === 0 ? (
          <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
            <FileKey2 />
            <p className="font-semibold">没有匹配当前筛选条件的预认证密钥。</p>
          </TableList.Item>
        ) : (
          filteredKeys.map((key) => {
            // Tag-only keys have no user
            if (!key.user) {
              return (
                <TableList.Item key={key.id}>
                  <AuthKeyRow authKey={key} user={null} />
                </TableList.Item>
              );
            }

            // TODO: Why is Headscale using email as the user ID here?
            // https://github.com/juanfont/headscale/issues/2520
            const user = users.find((user) => user.id === key.user?.id);
            if (!user) {
              return null;
            }

            return (
              <TableList.Item key={key.id}>
                <AuthKeyRow authKey={key} user={user} />
              </TableList.Item>
            );
          })
        )}
      </TableList>
    </div>
  );
}
