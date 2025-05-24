import React from 'react';
import { Stack, TextField, TextFieldProps, StackProps } from '@mui/material';
import ItemBase from 'components/planner/depot/ItemBase';
import { getFarmCSS } from 'util/fns/depot/itemUtils';

interface ItemEditBoxProps {
    itemId: string;
    value?: number | string;
    onChange?: (value: number) => void;
    clickable?: boolean;
    onIconClick?: (id: string) => void;
    isFocused?: boolean;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    size?: number;
    width?: string;
    highlighted?: boolean;
    textFieldProps?: Partial<TextFieldProps>;
    stackProps?: Partial<StackProps>;
}

const ItemEditBox = React.memo(({
    itemId,
    value = "",
    onChange,
    clickable = false,
    onIconClick,
    isFocused = false,
    onFocus,
    size,
    width = "4ch",
    highlighted = false,
    textFieldProps = {},
    stackProps = {}
}: ItemEditBoxProps) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(Number(e.target.value));
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
        onFocus?.(e);
    };

    const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (clickable) onIconClick?.(itemId);
    };

    const slotProps = {
        htmlInput: {
            type: "text" as const,
            title: '',
            autoComplete: 'off',
            autoCorrect: 'off',
            spellCheck: 'false',
            sx: {
                textAlign: "right",
                width: width,
                flexGrow: 1,
                color: "primary",
                fontWeight: "bolder",
                ...(textFieldProps?.slotProps?.htmlInput as any)?.sx,
            },
        },
    };

    return (
        <Stack
            direction="row"
            alignItems="center"
            {...stackProps}
            sx={{
                zIndex: 2,
                ...(stackProps?.sx || {}),
            }}
        >
            <Stack
                direction="row"
                onClick={handleIconClick}
                sx={{
                    zIndex: 2,
                    ...(clickable && {
                        transition: "opacity 0.1s",
                        "&:focus, &:hover": {
                            opacity: 0.5,
                        },
                    }),
                    ...getFarmCSS('box', highlighted ? "primary.main" : 'unset' ),
                    ...(stackProps?.sx || {}),
                }}
            >
                <ItemBase itemId={itemId} size={size} />
            </Stack>
            <TextField
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                size="small"
                sx={{
                    ml: -2.5,
                    zIndex: 1,
                    ...(textFieldProps?.sx || {}),
                }}
                type="text"
                slotProps={slotProps}
                {...textFieldProps}
            />
        </Stack>
    );
}, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
        prevProps.value === nextProps.value &&
        prevProps.width === nextProps.width &&
        prevProps.isFocused === nextProps.isFocused &&
        prevProps.highlighted === nextProps.highlighted
    );
});
ItemEditBox.displayName = "ItemEditBox";

export default ItemEditBox;