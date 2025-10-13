import { Checkbox } from '@heroui/checkbox';
import { SelectItem } from '@heroui/select';
import { DC_TAG, KYB_TAG, KYC_TAG } from '@lib/deeploy-utils';
import CustomTabs from '@shared/CustomTabs';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import raw from 'world-countries';

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

    useEffect(() => {
        console.log('jobTags', jobTags);
    }, [jobTags]);

    if (!options.length) {
        return null;
    }
    return (
        <div className="col gap-4">
            <div className="text-[17px] leading-none font-medium">Nodes Options</div>

            <div className="col gap-2">
                <div className="col w-full gap-2">
                    <Label value="Target Countries" isOptional />

                    <StyledSelect
                        items={options}
                        selectedKeys={new Set<string>(nodesCountries)}
                        onSelectionChange={(keys) => {
                            setValue('specifications.nodesCountries', Array.from(keys) as string[], {
                                shouldDirty: true,
                            });
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

                <CustomTabs
                    tabs={[
                        {
                            key: 'all-nodes',
                            title: 'All nodes',
                        },
                        {
                            key: 'kyb-only',
                            title: 'KYB-nodes only',
                        },
                        {
                            key: 'kyc-only',
                            title: 'KYC-nodes only',
                        },
                    ]}
                    selectedKey={
                        jobTags?.includes(KYB_TAG) ? 'kyb-only' : jobTags?.includes(KYC_TAG) ? 'kyc-only' : 'all-nodes'
                    }
                    onSelectionChange={(key) => {
                        let tags: string[] = jobTags;

                        if (key === 'all-nodes') {
                            tags = jobTags.filter((tag) => tag !== KYB_TAG && tag !== KYC_TAG);
                        } else if (key === 'kyb-only') {
                            tags = [...jobTags.filter((tag) => tag !== KYC_TAG), KYB_TAG];
                        } else if (key === 'kyc-only') {
                            tags = [...jobTags.filter((tag) => tag !== KYB_TAG), KYC_TAG];
                        }

                        setValue('specifications.jobTags', tags, { shouldDirty: true });
                    }}
                    isCompact
                />
            </div>

            <Checkbox
                isSelected={jobTags?.includes(DC_TAG)}
                onValueChange={(value) => {
                    if (value) {
                        setValue('specifications.jobTags', [...(jobTags ?? []), DC_TAG], { shouldDirty: true });
                    } else {
                        setValue('specifications.jobTags', jobTags?.filter((tag) => tag !== DC_TAG) ?? [], {
                            shouldDirty: true,
                        });
                    }
                }}
            >
                <div className="compact text-slate-600">Certified data centers only</div>
            </Checkbox>
        </div>
    );
}
