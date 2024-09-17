import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Autocomplete,
  autocompleteClasses,
  Box,
  FilterOptionsState,
  InputAdornment,
  Popper,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React, { useCallback } from "react";
import { VariableSizeList, ListChildComponentProps } from "react-window";

import operatorsJson from "data/operators.json";
import { OperatorData } from "types/operator";

const normalizeOperatorName = (operatorName: string) =>
  operatorName.toLowerCase().replace(/['"]/g, "").replace("ł", "l");

const operators = Object.values(operatorsJson)
  .filter((op) => op.rarity >= 3)
  .sort((a, b) => a.name.localeCompare(b.name));

const operatorNormalizedNames = Object.fromEntries(
  operators.map((op) => [op.name, normalizeOperatorName(op.name)])
);

interface Props {
  value: OperatorData | null;
  onChange: (value: OperatorData | null) => void;
}

const OperatorSearch = (props: Props) => {
  const { value, onChange } = props;

  const filterOptions = useCallback(
    (operators: OperatorData[], { inputValue }: FilterOptionsState<OperatorData>) => {
      const normalizedInput = normalizeOperatorName(inputValue);
      return operators.filter((op) =>
        operatorNormalizedNames[op.name].includes(normalizedInput)
      );
    },
    []
  );

  return (
    <Autocomplete<OperatorData> value={value}
      autoComplete
      autoHighlight
      onChange={(_: unknown, newValue: OperatorData | null) => onChange(newValue)}
      PopperComponent={StyledPopper}
      ListboxComponent={ListboxComponent}
      options={operators}
      getOptionLabel={(op) => op.name}
      renderInput={(params) => {
        const { InputProps, ...otherParams } = params;
        const { startAdornment: _, ...otherInputProps } = InputProps;
        return (
          <TextField
            {...otherParams}
            label="Choose an operator"
            sx={{
              "& .MuiInputBase-input": {
                pl: 0,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ pl: 1 }}>
                  {value != null ? (
                    <Image
                      src={`/img/avatars/${value.id}.png`}
                      width={32}
                      height={32}
                      alt=""
                      className="operator-avatar"
                    />
                  ) : (
                    <AccountCircleIcon width={32} height={32} />
                  )}
                </InputAdornment>
              ),
              ...otherInputProps,
            }}
          />
        );
      }}
      renderOption={(props, option) => [props, option] as React.ReactNode}
      disableListWrap
      filterOptions={filterOptions}
      sx={{
        flexGrow: 1,
      }}
    />
  );
};
export default OperatorSearch;

// virtualization behavior from this example:
// https://mui.com/components/autocomplete/#virtualization
const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0,
    },
  },
});

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };

  return (
    <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
      <Box mr={2} display="inline-flex" alignItems="center">
        <Image
          src={`/img/avatars/${dataSet[1].id}.png`}
          width={32}
          height={32}
          alt=""
          className="operator-avatar"
        />
      </Box>
      {dataSet[1].name}
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});
OuterElementType.displayName = "OuterElementType";

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactChild[] = [];
  (children as React.ReactChild[]).forEach(
    (item: React.ReactChild & { children?: React.ReactChild[] }) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    }
  );

  const itemCount = itemData.length;
  const itemSize = 44;

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.length * itemSize;
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={() => itemSize}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});
