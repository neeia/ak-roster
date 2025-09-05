import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, IconButton, Badge, Tooltip } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import Image from "components/base/Image";
import React from "react";
import imageBase from "util/imageBase";
import { getBranches } from "util/fns/classesUtils";
import classList from "data/classList";

interface Props extends Omit<ToggleButtonGroupProps, "onChange"> {
  onChange: (value: string) => void;
  onBranchesClose: () => void;
  expandedClass: string | null;
}

const ClassFilter = ({ value, onChange, onBranchesClose, expandedClass }: Props) => {
  const branches = expandedClass ? getBranches(expandedClass) : [];

  const countSelectedBranches = (c: string) => {
    const branches = getBranches(c).map((b) => b.id);
    return value.filter((v: string) => branches.includes(v)).length;
  };

  const isClassSelected = (className: string): boolean => {
    return expandedClass === className && value.includes(expandedClass);
  };

  return (
    <>
      <ToggleButtonGroup
        value={value}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(8, 1fr)" },
          width: "100%",
          gap: 1,
        }}
      >
        {classList.map((c) => {
          const branchCount = countSelectedBranches(c);
          return (
            <ToggleButton
              value={c}
              key={c}
              onChange={() => {
                onChange(c)
              }}
              sx={{
                borderRadius: 1,
                borderStyle: isClassSelected(c) ? "solid !important" : "unset",
                borderWidth: isClassSelected(c) ? "0.25rem !important" : "unset"
              }}
            >
              <Badge
                badgeContent={branchCount > 0 ? branchCount : 0} color="primary" overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Image width={40} height={40} src={`${imageBase}/classes/class_${c.toLowerCase()}.webp`} alt={c} />
              </Badge>
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
      {branches.length > 0 && (
        <ToggleButtonGroup
          value={value.filter((v: string) => branches.some((b) => b.id === v))}
          sx={{
            height: { xs: "auto", sm: "5.7rem" }, //remove jumpiness with fixed height
            alignContent: "flex-start",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
            width: "100%"
          }}
        >
          {branches.map((b) => (
            <Tooltip key={b.id} title={b.name} arrow placement="top">
              <ToggleButton
                key={b.id}
                value={b.id}
                disabled={!isClassSelected(expandedClass || "")}
                onChange={() => onChange(b.id)}
                sx={{ borderRadius: 1 }}
              >
                <Image width={35} height={35} src={`${imageBase}/subclass/sub_${b.id.toLowerCase()}_icon.webp`} alt={b.name}
                  sx={{
                    pointerEvents: "none",
                  }}
                />
              </ToggleButton>
            </Tooltip>
          ))}
          {expandedClass && <IconButton
            onClick={onBranchesClose}>
            <CloseIcon />
          </IconButton>}
        </ToggleButtonGroup>
      )}
    </>
  )
}

export default ClassFilter;