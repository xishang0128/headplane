import { AlertCircle } from "lucide-react";

import Card from "~/components/card";
import Code from "~/components/code";

export function OidcErrorNotice({ code }: { code: string }) {
  return (
    <Card className="m-4 mb-4 max-w-md border border-red-500 sm:m-0 sm:mb-4">
      <div className="flex items-center justify-between gap-4">
        <Card.Title className="text-red-500">配置问题</Card.Title>
        <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
      </div>
      {getErrorMessage(code)}
    </Card>
  );
}

function getErrorMessage(code: string) {
  switch (code) {
    case "error_no_query":
      return (
        <Card.Text>
          SSO 提供商未正确地将必要参数重定向到 Headplane。请确保您的 SSO 提供商已正确配置。
        </Card.Text>
      );

    case "error_no_session":
    case "error_invalid_session":
      return (
        <Card.Text>
          由于会话数据缺失或无效，无法完成 SSO 登录。请确保 Headplane 的 Cookie 配置正确，且您的浏览器已允许 Cookie。
        </Card.Text>
      );

    case "error_no_sub":
      return (
        <Card.Text>
          SSO 提供商未返回有效的用户标识符。请确保您的 SSO 提供商已正确配置，以提供 <Code>sub</Code> 屘。
        </Card.Text>
      );

    case "error_auth_failed":
      return (
        <Card.Text>
          与 SSO 提供商的身份验证失败。请稍后重试。Headplane 日志可能提供更多信息。
        </Card.Text>
      );

    default:
      return (
        <Card.Text>
          OIDC 身份验证期间发生未知错误。请稍后重试。
        </Card.Text>
      );
  }
}
