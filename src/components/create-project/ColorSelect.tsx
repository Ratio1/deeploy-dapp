import { COLOR_TYPES } from '@data/colorTypes';
import { SelectItem } from '@heroui/select';
import Label from '@shared/Label';
import StyledSelect from '@shared/StyledSelect';
import { Controller, useFormContext } from 'react-hook-form';

export default function ColorSelect() {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            <Label value="Color" />

            <Controller
                name="color"
                control={control}
                render={({ field, fieldState }) => (
                    <StyledSelect
                        items={COLOR_TYPES}
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0] as string;
                            field.onChange(selectedKey);
                        }}
                        onBlur={field.onBlur}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        placeholder="Select a color"
                        renderValue={(items) => {
                            return items.map((item) => (
                                <ColorOption
                                    key={item.key}
                                    colorHex={String(item.key as string)}
                                    colorName={String(item.textValue as string)}
                                />
                            ));
                        }}
                    >
                        {COLOR_TYPES.map((color) => (
                            <SelectItem key={color.hex} textValue={color.name}>
                                <ColorOption colorHex={color.hex} colorName={color.name} />
                            </SelectItem>
                        ))}
                    </StyledSelect>
                )}
            />
        </div>
    );
}

function ColorOption({ colorHex, colorName }: { colorHex: string; colorName: string }) {
    return (
        <div className="row gap-2 py-1">
            <div className="mt-px h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorHex }}></div>
            <div className="font-medium">{colorName}</div>
        </div>
    );
}
