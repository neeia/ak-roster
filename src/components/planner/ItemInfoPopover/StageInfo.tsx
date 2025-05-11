import { Stack, Typography } from "@mui/material";
import Image from "next/image";
import { Item, StageData } from "types/item";

import ItemInfoSection from "./ItemInfoSection";

interface Props {
  item: Item;
}

const StageInfo: React.FC<Props> = (props) => {
  const { item } = props;

  if (
    item.stages == null ||
    (item.stages.mostEfficient == null && item.stages.leastSanity == null)
  ) {
    return null;
  }

  const hasTwoRecommended =
    item.stages.mostEfficient != null && item.stages.leastSanity != null;
  const stages = (
    <>
      {item.stages.mostEfficient && (
        <Stage stage={item.stages.mostEfficient} stageType="Most efficient" />
      )}
      {item.stages.leastSanity && (
        <Stage stage={item.stages.leastSanity} stageType="Least sanity" />
      )}
    </>
  );

  return (
    <ItemInfoSection heading="Recommended stages">
      {hasTwoRecommended ? (
        <Stack spacing={2} direction="row" justifyContent="space-evenly">
          {stages}
        </Stack>
      ) : (
        stages
      )}
    </ItemInfoSection>
  );
};
export default StageInfo;

const Stage: React.FC<{ stage: StageData; stageType: string }> = (props) => {
  const { stage, stageType } = props;
  const { stageName, dropRate, stageSanityCost, itemSanityCost } = stage;

  return (
    <Stack alignItems="center">
      <span>{stageType}</span>
      <Typography variant="h4" component="span">
        {stageName}
      </Typography>
      <span>{Math.round(dropRate * 100)}% chance</span>
      <span>
        Stage cost: {stageSanityCost}
        <Image src="/img/sanity.png" alt="Sanity" width={18} height={18} />
      </span>
      <span>
        Cost per item: {itemSanityCost}
        <Image src="/img/sanity.png" alt="Sanity" width={18} height={18} />
      </span>
    </Stack>
  );
};
