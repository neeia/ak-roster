import React from "react";
import { Operator, OpJsonObj } from "../../types/operator";
import operatorJson from "../../data/operators.json";
import { classList } from "../../util/classList";
import { Box, ButtonBase, Typography } from "@mui/material";
import { rarityColors } from "../../styles/rarityColors";
import useLocalStorage from "../../util/useLocalStorage";
import FavoriteIcon from '@mui/icons-material/Favorite';

interface Props {
  onClick: (op: Operator) => void;
  filter?: (op: any) => boolean;
  toggleGroup?: string[];
  postSort?: (opA: any, opB: any) => number;
}

const OperatorSelector = React.memo((props: Props) => {
  const { onClick, filter, postSort } = props;

  const [operators, setOperators] = useLocalStorage<Record<string, Operator>>(
    "operators", {}
  );
  const ps = postSort ?? (() => 0)

  function sortComparator(a: any, b: any) {
    return ps(a, b) ||
      b.rarity - a.rarity ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
  }
  const OperatorButton = (op: Operator) => {
    const [n, t] = op.name.split(" the ");
    const name = t ?? n;
    const nameComponent =
      <Typography
        component="div"
        variant={name.length > 12 ? "caption2" : "caption"}
        sx={{ lineHeight: "1.25rem" }}
      >
        {name}
      </Typography>

    // Process operator name
    let opName = (
      t
        ? <Box
          component="abbr"
          title={op.name}
        >
          {nameComponent}
        </Box>
        : <Box
        >
          {nameComponent}
        </Box>
    )

    const imgUrl = `/img/avatars/${op.id + (op.promotion === 2 ? "_2" : "")}.png`;

    return (
      <ButtonBase
        onClick={() => onClick(op)}
        sx={{
          display: "grid",
          boxShadow: 2,
        }}>
        <Box
          component="img"
          sx={{
            width: `5rem`,
            gridArea: "1 / 1",
            borderBottom: `3px solid ${rarityColors[op.rarity]}`,
          }}
          src={imgUrl}
          alt=""
        />
        <Box sx={{
          gridArea: "1 / 1",
          textAlign: "left",
          alignSelf: "start",
        }}>
          {op.favorite
            ? <FavoriteIcon/>
            : ""}
        </Box>
        {opName}
      </ButtonBase>
    )
  }

  // Operator Selector Component
  return (
    <Box component="ul" sx={{
      display: "contents"
    }}>
      {Object.values(operatorJson)
        .filter(filter ?? (() => true))
        .sort(sortComparator)
        .map((op: Operator) => {
          return <Box
            component="li"
            sx={{ listStyleType: "none" }}
            key={op.id}
          >
            {OperatorButton(op)}
          </Box>
        })
      }
    </Box>)
});
export default OperatorSelector;
