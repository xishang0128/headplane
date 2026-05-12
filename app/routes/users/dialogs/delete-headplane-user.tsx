import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import type { Role } from "~/server/web/roles";

interface DeleteHeadplaneUserProps {
  userId: string;
  displayName: string;
  role: Role;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function DeleteHeadplaneUser({
  userId,
  displayName,
  role,
  isOpen,
  setIsOpen,
}: DeleteHeadplaneUserProps) {
  const isOwner = role === "owner";

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant={isOwner ? "unactionable" : "destructive"}>
        <Title>删除 {displayName} 的 Headplane 用户？</Title>
        {isOwner ? (
          <Text className="mb-6">不能删除 Headplane 所有者。请先转移所有权。</Text>
        ) : (
          <>
            <Text className="mb-6">
              这只会删除该用户在 Headplane 中的登录记录、角色和关联关系，不会删除 Headscale
              用户、设备或认证密钥。 如果该用户再次通过 SSO 登录，将重新创建为未授权的成员。
            </Text>
            <input name="action_id" type="hidden" value="delete_headplane_user" />
            <input name="user_id" type="hidden" value={userId} />
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}
