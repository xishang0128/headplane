import Dialog, { DialogPanel } from "~/components/dialog";
import Notice from "~/components/notice";
import Text from "~/components/text";
import Title from "~/components/title";

interface TransferOwnershipProps {
  targetUserId: string;
  targetDisplayName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function TransferOwnership({
  targetUserId,
  targetDisplayName,
  isOpen,
  setIsOpen,
}: TransferOwnershipProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant="destructive">
        <Title>将所有权转移给 {targetDisplayName}？</Title>
        <Text className="mb-6">
          这将使 {targetDisplayName} 成为此 Headplane 实例的新所有者。您将被降级为管理员。此操作无法轻易恤销。
        </Text>
        <Notice variant="warning">
          只有所有者才能转移所有权。转移后，您将无法继续管理所有权。
        </Notice>
        <input name="action_id" type="hidden" value="transfer_ownership" />
        <input name="user_id" type="hidden" value={targetUserId} />
      </DialogPanel>
    </Dialog>
  );
}
