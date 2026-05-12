import { type } from "arktype";

import Code from "~/components/code";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import type { Machine } from "~/types";

const renameSchema = type({
  name: "string > 0",
});

interface RenameProps {
  machine: Machine;
  isOpen: boolean;
  magic?: string;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Rename({ machine, magic, isOpen, setIsOpen }: RenameProps) {
  const form = useForm({
    schema: renameSchema,
    defaultValues: { name: machine.givenName },
  });
  const name = form.values.name as string;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel>
        <Title>编辑 {machine.givenName} 的机器名称</Title>
        <Text className="mb-6">
          此名称显示在管理面板、Tailscale 客户端中，并用于生成 MagicDNS 名称。
        </Text>
        <input name="action_id" type="hidden" value="rename" />
        <input name="node_id" type="hidden" value={machine.id} />
        <Input {...form.field("name")} required label="机器名称" placeholder="机器名称" />
        {magic ? (
          name.length > 0 && name !== machine.givenName ? (
            <p className="mt-2 text-sm leading-tight text-mist-600 dark:text-mist-300">
              此机器将可通过主机名 <Code className="text-sm">{name.toLowerCase().replaceAll(/\s+/g, "-")}</Code>
              {" "}访问。主机名 <Code className="text-sm">{machine.givenName}</Code> 将不再指向此机器。
            </p>
          ) : (
            <p className="mt-2 text-sm leading-tight text-mist-600 dark:text-mist-300">
              此机器可通过主机名 <Code className="text-sm">{machine.givenName}</Code> 访问。
            </p>
          )
        ) : undefined}
      </DialogPanel>
    </Dialog>
  );
}
