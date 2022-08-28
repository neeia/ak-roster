import { MenuItem, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import { AccountInfo } from "../../../types/doctor";
import { FilterFunction } from "../../../types/filter";
import { OpJsonObj } from "../../../types/operator";
import useLocalStorage from "../../../util/useLocalStorage";

const filters: Record<string, { label: string, fn: FilterFunction }> = {
  "ANY": {
    label: "Any",
    fn: () => true,
  },
  "CN": {
    label: "CN Only",
    fn: (op: OpJsonObj) => op.isCnOnly,
  },
  "EN": {
    label: "EN Only",
    fn: (op: OpJsonObj) => !op.isCnOnly,
  }
}
const filterKey = "cn";

interface Props {
  addFilter: (property: string, key: string, value: FilterFunction) => void;
  removeFilter: (property: string, key: string) => void;
}

const ServerFilter = (props: Props) => {
  const { addFilter, removeFilter } = props;
  const [doctor] = useLocalStorage<AccountInfo>("doctor", {});

  const [serverFilter, _setServerFilter] = useState<string>(doctor.server ? (doctor.server === "CN" ? doctor.server : "EN") : "ANY");
  const setServerFilter = (s: string) => {
    console.log("Attempting to delete " + serverFilter)
    removeFilter(filterKey, serverFilter);
    _setServerFilter(s);
    console.log("Attempting to add " + s)
    addFilter(filterKey, s, filters[s].fn);
  }

  useEffect(() => {
    addFilter(filterKey, serverFilter, filters[serverFilter].fn);
  }, [])

  return (
    <TextField
      id="Select Server"
      label="Server"
      variant="filled"
      select
      value={serverFilter}
      onChange={(e) => setServerFilter(e.target.value)}
      sx={{ width: "6rem" }}
    >
      {Object.keys(filters).map((s) => (
        <MenuItem key={s} value={s}>
          {filters[s].label}
        </MenuItem>
      ))}
    </TextField>);
}

export default ServerFilter;