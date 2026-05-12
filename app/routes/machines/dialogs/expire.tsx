import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import type { Machine } from "~/types";

interface ExpireProps {
  machine: Machine;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Expire({ machine, isOpen, setIsOpen }: ExpireProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant="destructive">
        <Title>使 {machine.givenName} 过期</Title>
        <Text>
          这将断开该机器与 Tailnet 的连接。如需重新连接，您需要在设备上重新认证。
        </Text>
        <input name="action_id" type="hidden" value="expire" />
        <input name="node_id" type="hidden" value={machine.id} />
      </DialogPanel>
    </Dialog>
  );
}
