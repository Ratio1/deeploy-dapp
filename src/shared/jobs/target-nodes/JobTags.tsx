import { Checkbox } from '@heroui/checkbox';
import { useFormContext } from 'react-hook-form';
import { RiSuitcaseLine } from 'react-icons/ri';

export default function JobTags() {
    const { watch, setValue } = useFormContext();

    const jobTags: string[] = watch('specifications.jobTags');

    return (
        <div className="flex">
            <Checkbox
                icon={<RiSuitcaseLine />}
                isSelected={jobTags?.includes('EE_NODETAG_KYB')}
                onValueChange={(value) => {
                    if (value) {
                        setValue('specifications.jobTags', [...jobTags, 'EE_NODETAG_KYB']);
                    } else {
                        setValue(
                            'specifications.jobTags',
                            jobTags?.filter((tag) => tag !== 'EE_NODETAG_KYB'),
                        );
                    }
                }}
            >
                <div className="compact text-slate-500">Deploy to KYB-nodes only</div>
            </Checkbox>
        </div>
    );
}
