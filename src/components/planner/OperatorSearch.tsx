import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import {
  Autocomplete,
  autocompleteClasses,
  AutocompleteProps,
  Box,
  FilterOptionsState,
  InputAdornment,
  Link,
  Popper,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import Image from "components/base/Image";
import React, { useCallback, useMemo } from "react";
import { VariableSizeList, ListChildComponentProps } from "react-window";

import operatorsJson from "data/operators.json";
import { OperatorData } from "types/operators/operator";
import SomePartial from "types/somePartial";
import { SortFunctionFields, SortListItem } from "types/sort";
import imageBase from "util/imageBase";
import useSettings from "util/hooks/useSettings";
import useSort from "util/hooks/useSort";

export const normalizeOperatorName = (operatorName: string) =>
  operatorName.toLowerCase().replace(/['"]/g, "").replace("ł", "l").replace("š", "s");
export const matchOperatorName = (operatorName: string, search: string) => {
  return normalizeOperatorName(operatorName.toLocaleLowerCase()).includes(
    normalizeOperatorName(search.toLocaleLowerCase())
  );
};

const operators = Object.values(operatorsJson).sort((a, b) => a.name.localeCompare(b.name));

const operatorNormalizedNames = Object.fromEntries(operators.map((op) => [op.name, normalizeOperatorName(op.name)]));

const defaultSearchSort: SortListItem[] = [
  { key: "Release Date", desc: true },
  { key: "Rarity", desc: true },
  { key: "Name", desc: false },
];

const OperatorSortContext = React.createContext<{
  sorts: SortListItem[];
  handleSortClick: (key: keyof SortFunctionFields) => void;
} | null>(null);

interface Props
  extends Omit<
    SomePartial<AutocompleteProps<OperatorData, false, false, false>, "renderInput">,
    "onChange" | "options"
  > {
  value: OperatorData | null;
  onChange: (value: OperatorData | null) => void;
  filter?: (value: OperatorData) => boolean;
}

const OperatorSearch = (props: Props) => {
  const { value, onChange, filter = () => true, sx, ...rest } = props;
  const [settings, setSettings] = useSettings();
  const pageSort = (settings?.sortingSettings?.operatorSearch ?? []).length > 0
    ? settings.sortingSettings.operatorSearch
    : defaultSearchSort;
  const { sorts, toggleSort, sortFunction } = useSort(pageSort, setSettings, "operatorSearch");

  const handleSortClick = useCallback((key: keyof SortFunctionFields) => {
    const selectedSort = sorts.find((sort) => sort.key === key);
    if (!selectedSort) return;

    if (key !== "Name" && sorts[sorts.length - 1]?.key !== "Name") {
      const nameSort = sorts.find((sort) => sort.key === "Name"); 
      toggleSort("Name", (nameSort?.desc ?? true), "last");
    } else {
      toggleSort(key, sorts[0]?.key === key ? !selectedSort.desc : selectedSort.desc, "first");
    }
  }, [sorts, toggleSort]);

  const sortContext = useMemo(
    () => ({ sorts, handleSortClick }),
    [sorts, handleSortClick]
  );

  const filterOptions = useCallback(
    (operators: OperatorData[], { inputValue }: FilterOptionsState<OperatorData>) => {
      const normalizedInput = normalizeOperatorName(inputValue);
      return operators
        .filter((op) => operatorNormalizedNames[op.name].includes(normalizedInput) && filter(op))
        .sort(sortFunction);
    },
    [filter, sortFunction]
  );

  return (
    <OperatorSortContext.Provider value={sortContext}>
      <Autocomplete<OperatorData>
        value={value}
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
              slotProps={{
                input: {
                  autoFocus: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 1 }}>
                      {value != null ? (
                        <Image
                          src={`${imageBase}/avatars/${value.id}.webp`}
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
                },
              }}
            />
          );
        }}
        renderOption={(props, option) => [props, option] as React.ReactNode}
        disableListWrap
        filterOptions={filterOptions}
        sx={{
          flexGrow: 1,
          ...sx,
        }}
        {...rest}
      />
    </OperatorSortContext.Provider>
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
  const [_props, opData] = data[index] as [React.HTMLAttributes<HTMLLIElement> & { key: any }, OperatorData];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };

  const { key, ...rest } = _props;

  return (
    <Typography component="li" key={key} {...rest} noWrap style={inlineStyle}>
      <Box mr={2} display="inline-flex" alignItems="center">
        <Image
          src={`${imageBase}/avatars/${opData.id}.webp`}
          width={32}
          height={32}
          alt=""
          className="operator-avatar"
        />
      </Box>
      {opData.name}
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
const ListboxComponent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(function ListboxComponent(
  props,
  ref
) {
  const sortContext = React.useContext(OperatorSortContext);
  const { children, ...other } = props;
  const itemData: React.ReactNode[] = [];
  (children as React.ReactElement[]).forEach((item: React.ReactElement & { children?: React.ReactElement[] }) => {
    itemData.push(item);
    itemData.push(...(item.children || []));
  });

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
      {sortContext && (
        <Box
          sx={{ display: "flex", justifyContent: "space-around", gap: 1, px: 1, py: 0.5 }}
          onMouseDown={(event) => event.preventDefault()}
        >
          {(["Name", "Release Date"] as const).map((key) => {
            const sort = sortContext.sorts.find((item) => item.key === key);
            if (!sort) return null;
            const isPrimary = sortContext.sorts[0]?.key === key;
            const DirectionIcon = sort.desc ? ArrowDownward : ArrowUpward;
            return (
              <Link
                key={key}
                component="button"
                type="button"
                underline="always"
                aria-label={`${key}, ${sort.desc ? "descending" : "ascending"}; click to prioritize or reverse if already active`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  sortContext.handleSortClick(key as keyof SortFunctionFields);
                }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontWeight: isPrimary ? "bold" : "normal",
                }}
              >
                {key}
                <DirectionIcon fontSize="small" />
              </Link>
            );
          })}
        </Box>
      )}
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
