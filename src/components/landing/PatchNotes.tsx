import React from "react";
import Box, { BoxProps } from "@mui/material/Box";
import patchJson from "data/patch";
import { Typography } from "@mui/material";
import { isArray } from "lodash";

type NestedArray = string | NestedArray[];
interface NestedListProps {
  content: NestedArray;
}
const NestedList = (props: NestedListProps) => {
  if (isArray(props.content))
    return (
      <ul>
        {props.content.map((s, i) => (
          <NestedList content={s} key={i}></NestedList>
        ))}
      </ul>
    );
  else return <li>{props.content}</li>;
};

interface Props extends BoxProps {}

const Update = (props: Props) => {
  const {} = props;

  return (
    <Box component="ol" sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {patchJson.map(({ version, date, title, content, changelog }) => (
        <Box component="li" key={version} sx={{ display: "flex", flexDirection: "column", "& ul + li": { mt: 1 } }}>
          <Typography variant="h3" sx={{ m: 0 }}>
            <a href={`#v${version}`}>{version}</a> - {date}
          </Typography>
          <Typography variant="h2" id={`v${version}`}>
            {title}
          </Typography>
          {content.map((s, i) => (
            <Typography key={i}>{s}</Typography>
          ))}
          {changelog?.length > 0 && (
            <>
              <Typography variant="h3" sx={{ m: 0, my: 1 }}>
                Changes
              </Typography>
              <NestedList content={changelog} />
            </>
          )}
        </Box>
      ))}
    </Box>
  );
};
export default Update;
