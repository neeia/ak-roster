import { CloudDownloadOutlined, CloudSyncOutlined, CloudUploadOutlined, FileDownloadOutlined } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { User } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import React from "react";
import useOperators from "../../util/useOperators";
import useSync from "../../util/useSync";


interface Props {
  user: User;
}

const Data = ((props: Props) => {
  const { user } = props;
  const db = getDatabase();
  const [safeSyncAll] = useSync();
  const [operators, , , setOperators] = useOperators();

  const syncData = () => {
    safeSyncAll(user);
  }
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

  return (
    <>
      Data Management
      <Box sx={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        "& .MuiButton-root": {
          display: "flex",
          flexDirection: "column",
        }
      }}>
        <Button onClick={syncData}>
          <CloudSyncOutlined fontSize="large" />
          Sync Data
        </Button>
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
          <FileDownloadOutlined fontSize="large" />
          Export JSON
        </Button>
      </Box>
    </>);
});

export default Data;