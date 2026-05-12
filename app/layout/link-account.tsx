import { Form } from "react-router";

import Button from "~/components/button";
import Card from "~/components/card";
import cn from "~/utils/cn";

interface LinkAccountProps {
  headscaleUsers: { id: string; name: string }[];
}

export default function LinkAccount({ headscaleUsers }: LinkAccountProps) {
  return (
    <div className="mx-auto mt-6 flex max-w-xl flex-col items-center justify-center py-36">
      <Card variant="flat" className="max-w-xl items-center gap-4">
        <Card.Title>关联您的 Headscale 账户</Card.Title>
        <Card.Text>
          Headplane 无法自动将您的 SSO 身份与现有 Headscale 用户匹配。
          请从下列列表中选择您的用户以关联账户并继续。
        </Card.Text>
        <Form method="POST" className="mt-4">
          <select
            className={cn(
              "mb-4 w-full rounded-lg border p-2",
              "border-mist-200 dark:border-mist-700",
              "bg-mist-50 dark:bg-mist-900",
            )}
            name="headscale_user_id"
            required
          >
            <option value="">选择用户...</option>
            {headscaleUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <Button className="w-full" type="submit" variant="heavy">
            关联并继续
          </Button>
        </Form>
        <Card.Text className="mt-8 text-center text-xs text-mist-600 dark:text-mist-300">
          如果您未看到自己的用户，请联系您的管理员。如需未来自动关联新用户，请确保 Headscale 用户的电子邮件地址与 SSO 身份一致。
        </Card.Text>
      </Card>
    </div>
  );
}
