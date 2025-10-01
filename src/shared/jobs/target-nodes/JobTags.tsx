import { Checkbox } from '@heroui/checkbox';
import { SelectItem } from '@heroui/select';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import raw from 'world-countries';

const KYB_TAG = 'IS_KYB';
const DC_TAG = 'DC:*';

export default function JobTags() {
    const { watch, setValue } = useFormContext();

    const jobTags: string[] = watch('specifications.jobTags');
    const nodesCountries: string[] = watch('specifications.nodesCountries');

    const [options, setOptions] = useState<
        {
            key: string;
            label: string;
        }[]
    >([]);

    useEffect(() => {
        setOptions(raw.map((c) => ({ key: c.cca2, label: c.name.common })).sort((a, b) => a.label.localeCompare(b.label)));
    }, []);

    if (!options.length) {
        return null;
    }
    return (
        <div className="col gap-4">
            <div className="text-[17px] leading-none font-medium">Nodes Options</div>

            <div className="col w-full gap-2">
                <Label value="Target Countries" isOptional />

                <StyledSelect
                    items={options}
                    selectedKeys={new Set<string>(nodesCountries)}
                    onSelectionChange={(keys) => {
                        setValue('specifications.nodesCountries', Array.from(keys) as string[]);
                    }}
                    isMultiline={true}
                    selectionMode="multiple"
                    renderValue={(items) => {
                        return (
                            <div className="flex flex-wrap gap-1">
                                {items.map((item) => (
                                    <SmallTag key={item.key}>{item.textValue}</SmallTag>
                                ))}
                            </div>
                        );
                    }}
                    placeholder="Select countries"
                    scrollShadowProps={{
                        hideScrollBar: false,
                    }}
                    isClearable
                >
                    {options.map((option) => (
                        <SelectItem key={option.key} textValue={option.label}>
                            {option.label}
                        </SelectItem>
                    ))}
                </StyledSelect>
            </div>

            <div className="col gap-2">
                <Checkbox
                    isSelected={jobTags?.includes(KYB_TAG)}
                    onValueChange={(value) => {
                        if (value) {
                            setValue('specifications.jobTags', [...jobTags, KYB_TAG]);
                        } else {
                            setValue(
                                'specifications.jobTags',
                                jobTags?.filter((tag) => tag !== KYB_TAG),
                            );
                        }
                    }}
                >
                    <div className="compact text-slate-600">KYB-nodes only</div>
                </Checkbox>

                <Checkbox
                    isSelected={jobTags?.includes(DC_TAG)}
                    onValueChange={(value) => {
                        if (value) {
                            setValue('specifications.jobTags', [...jobTags, DC_TAG]);
                        } else {
                            setValue(
                                'specifications.jobTags',
                                jobTags?.filter((tag) => tag !== DC_TAG),
                            );
                        }
                    }}
                >
                    <div className="compact text-slate-600">Certified data centers only</div>
                </Checkbox>
            </div>
        </div>
    );
}
