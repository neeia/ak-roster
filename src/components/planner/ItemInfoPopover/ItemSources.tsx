import { Box, Button, Typography } from "@mui/material";
import { Item } from "types/item";

import ItemInfoSection from "./ItemInfoSection";
import React from "react";
import { EventsData } from "types/events";
import { BATTLE_RECORD_TO_EXP } from "util/fns/depot/depotToExp";
import { formatNumber } from "util/fns/depot/itemUtils";

interface Props {
  item: Item;
  openEventTracker: () => void;
  eventsData: EventsData;
}

const ItemSources: React.FC<Props> = (props) => {
  const { item, openEventTracker, eventsData } = props;

  const eventNames = Object.keys(eventsData ?? {});

  let total = 0, farmableTimes = 0;
  let firstInfiniteShop = {index: Number.MAX_SAFE_INTEGER, name: ""};

  const materialData = eventNames.flatMap((eventName) => {
    const event = eventsData[eventName];
    const results = [];
    if (event.farms?.includes(item.id)) {
      farmableTimes += 1;
      results.push({ index: event.index, event: eventName, amount: "farmable" });
    }
    if (event.infinite?.includes(item.id) && event.index < firstInfiniteShop.index) {
      firstInfiniteShop = {index: event.index, name: eventName};
    }
    if (item.id in event.materials) {
      const amount = event.materials[item.id];
      total += amount;
      results.push({ index: event.index, event: eventName, amount: formatNumber(amount) });
    }
    if (item.id == "EXP") {
      const totalExp = Object.entries(BATTLE_RECORD_TO_EXP).reduce(
        (acc, [id, value]) => acc + (event.materials[id] ?? 0) * value, 0
      );
      total += totalExp;
      if (totalExp) {
        results.push({ index: event.index, event: eventName, amount: formatNumber(totalExp) });
      }
    }
    return results;
  });
  materialData.sort((a, b) => a.index - b.index);

  return (
    <ItemInfoSection heading="Event sources">
      {eventNames.length === 0 ? (
        <Button
          onClick={openEventTracker}
          sx={{
            color: "text.secondary",
          }}
        >
          Add or import events in the Event Tracker to see upcoming sources
        </Button>
      ) : Object.keys(materialData).length === 0 && !firstInfiniteShop.name ? (
          <Box sx={{ paddingLeft: "4px" }}>{"No upcoming events have this material :("}</Box>
        ) : (
          <>
            <Box
              component="dl"
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                rowGap: "2px",
                columnGap: "16px",
                maxHeight: "max(30vh, 300px)",
                overflowY: "auto"
              }}
            >
              {materialData.map((result) =>
                <EventRow key={result.event + "|" + result.amount} sx={{ maxWidth: "300px" }} label={result.event} amount={result.amount} />
              )}
            </Box>
            <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
              <EventRow label="Total" amount={formatNumber(total) + (farmableTimes ? (" + " + farmableTimes + " farmable") : "")} 
                sx={{ borderTop: "1px solid", borderColor: "text.secondary" }} />
            </Box>
            {firstInfiniteShop.name &&
              <Typography sx={{ paddingX: "4px", maxWidth: "600px" }}>Infinite stock in event shops, next available: {firstInfiniteShop.name}</Typography>
            }
          </>
        )
      }
    </ItemInfoSection>
  );
};
export default ItemSources;

const EventRow: React.FC<{ label: string, amount: string | number, sx?: any }> = (props) => {
  const { label, amount, sx } = props;
  return (
    <>
      <Box component="dt" sx={{ ...sx, paddingLeft: "4px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{label}</Box>
      <Box component="dd" sx={{ ...sx, textAlign: "right", marginLeft: 0, paddingRight: "4px" }}>{amount}</Box>
    </>
  )
};