import { Info } from "lucide-react";

import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export interface SubnetTagProps {
  isEnabled?: boolean;
}

export function SubnetTag({ isEnabled }: SubnetTagProps) {
  return (
    <Tooltip
      content={
        isEnabled ? (
          <>此机器广播了子网路由。</>
        ) : (
          <>
            此机器已申告尚未广播的子网路。请通过机器菜单中的“编辑路由设置”选项进行查看。
          </>
        )
      }
    >
      <Chip
        text="子网"
        className={cn("bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-300")}
        rightIcon={isEnabled ? undefined : <Info className="h-full w-fit" />}
      />
    </Tooltip>
  );
}
