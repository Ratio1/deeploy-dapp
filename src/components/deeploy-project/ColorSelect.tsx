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
                                <div key={item.key} className="row gap-2.5 py-1">
                                    <div
                                        className="mt-[1px] h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: item.key as string }}
                                    ></div>
                                    <div className="font-medium">{item.textValue}</div>
                                </div>
                            ));
                        }}
                    >
                        {COLOR_TYPES.map((color) => (
                            <SelectItem key={color.hex} textValue={color.name}>
                                <div className="row gap-2.5 py-1">
                                    <div
                                        className="mt-[1px] h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: color.hex }}
                                    ></div>
                                    <div className="font-medium">{color.name}</div>
                                </div>
                            </SelectItem>
                        ))}
                    </StyledSelect>
                )}
            />
        </div>
    );
}
