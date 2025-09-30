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
                isSelected={jobTags?.includes('IS_KYB')}
                onValueChange={(value) => {
                    if (value) {
                        setValue('specifications.jobTags', [...jobTags, 'IS_KYB']);
                    } else {
                        setValue(
                            'specifications.jobTags',
                            jobTags?.filter((tag) => tag !== 'IS_KYB'),
                        );
                    }
                }}
            >
                <div className="compact text-slate-600">Deploy to KYB-nodes only</div>
            </Checkbox>
        </div>
    );
}
