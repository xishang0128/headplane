import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import type { Machine, User } from "~/types";

interface DeleteProps {
  user: User;
  machines: Machine[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function DeleteUser({ user, machines, isOpen, setIsOpen }: DeleteProps) {
  const name = user.name || user.displayName;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant={machines.length > 0 ? "unactionable" : "normal"}>
        <Title>删除 {name}？</Title>
        {machines.length > 0 ? (
          <Text className="mb-6">
            有设备的用户无法删除。请先删除或转赋其设备到其他用户再继续。
          </Text>
        ) : (
          <Text className="mb-6">
            已删除的用户无法恢复。
            {user.provider === "oidc" && (
              <p className="mt-4 text-sm text-mist-600 dark:text-mist-300">
                由于该用户通过外部提供商认证，如果其再次登录，将重新创建该用户。
              </p>
            )}
          </Text>
        )}
        <input name="action_id" type="hidden" value="delete_user" />
        <input name="user_id" type="hidden" value={user.id} />
      </DialogPanel>
    </Dialog>
  );
}
