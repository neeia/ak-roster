import { CloudDownloadOutlined, CloudUploadOutlined, ContentPasteOutlined, DeleteForeverOutlined, FileDownloadOutlined, FileUploadOutlined, InventoryOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { updateProfile, User } from "firebase/auth";
import { child, get, getDatabase, ref, remove, set } from "firebase/database";
import React, { useState } from "react";
import { AccountInfo } from "../../types/doctor";
import useLocalStorage from "../../util/useLocalStorage";
import useOperators from "../../util/useOperators";
import UpdatePrivacy from "./UpdatePrivacy";

function isAlphaNumeric(str: string) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

interface Props {
  user: User;
}

const Data = ((props: Props) => {
  const { user } = props;
  const db = getDatabase();
  const [operators, , , setOperators] = useOperators();

  const forceSave = () => {
    set(ref(db, `users/${user.uid}/roster/`), operators);
  }
  const forceLoad = () => {
    get(ref(db, `users/${user.uid}/roster/`)).then(s1 => {
      if (s1.exists()) {
        setOperators(s1.val());
      }
    })
  }
  const exportJson = () => {
    set(ref(db, `users/${user.uid}/roster/`), operators);
  }
  const importJson = () => {
    set(ref(db, `users/${user.uid}/roster/`), operators);
  }

  return (
    <>
      Data Management
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        "& .MuiButton-root": {
          display: "flex",
          flexDirection: "column",
        }
      }}>
        <Button onClick={forceSave}>
          <CloudUploadOutlined fontSize="large" />
          Force Save
        </Button>
        <Button onClick={forceLoad}>
          <CloudDownloadOutlined fontSize="large" />
          Force Load
        </Button>
        <Button component="a"
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(operators)
          )}`}
          download="operators.json"
        >
          <FileUploadOutlined fontSize="large" />
          Export JSON
        </Button>
      </Box>
    </>);
});

export default Data;