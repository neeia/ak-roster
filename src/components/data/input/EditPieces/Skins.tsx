import React from "react";
import { Operator, Skin } from "types/operator";
import skinJson from "data/skins.json";
import { Box, Button, Tooltip } from "@mui/material";
import { changeSkin } from "util/changeOperator";
import Image from "next/image";

interface Props {
  op: Operator;
  onChange: (newOperator: Operator) => void;
}
const Skins = ((props: Props) => {
  const { op, onChange } = props;
  const opSkins: Skin[] = skinJson[op.op_id as keyof typeof skinJson];

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      justifyContent: "space-around",
      gap: "4px",
    }}>
      {opSkins.sort((a, b) => a.sortId - b.sortId).map((skin: Skin, i: number) => {
        // sortId -1 is the E2 skin, sortId -2 is Amiya's E1 skin
        const disabled = !op.potential || (skin.sortId === -1 && op.elite < 2) || (skin.sortId === -2 && op.elite < 1);
        return (
          <Tooltip title={skin.skinName ?? `Default Elite ${skin.sortId + 3}`} arrow describeChild key={`${op.op_id}-skn${i}`}>
            <span>
              <Button
                fullWidth
                className={op.skin === skin.avatarId.replace('#', "%23") ? "active" : "inactive"}
                onClick={() => onChange(changeSkin(op, skin.avatarId.replace('#', "%23")))}
                disabled={disabled}
              >
                <Image src={`/img/avatars/${skin.avatarId.replace('#', "%23")}.png`} width={48} height={48} alt={skin.skinName ?? ""} />
              </Button>
            </span>
          </Tooltip>
        );
      })}
    </Box>
  )
})
export default Skins;