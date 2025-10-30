import { Button } from '@heroui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePublicProfileInfo } from '@lib/api/backend';
import { buildPublicProfileSchema } from '@schemas/profile';
import InputWithLabel from '@shared/InputWithLabel';
import Label from '@shared/Label';
import StyledInput from '@shared/StyledInput';
import { BRANDING_PLATFORM_NAMES, PublicProfileInfo } from '@typedefs/general';
import { useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import z from 'zod';

export default function EditPublicProfile({
    profileInfo,
    brandingPlatforms,
    setEditing,
    onEdit,
}: {
    profileInfo: PublicProfileInfo;
    brandingPlatforms: string[];
    setEditing: (editing: boolean) => void;
    onEdit: () => void;
}) {
    const schema = useMemo(() => buildPublicProfileSchema(brandingPlatforms), [brandingPlatforms]);
    type FormValues = z.infer<typeof schema>;

    const [isLoading, setLoading] = useState<boolean>(false);

    const defaultValues: FormValues = useMemo(() => {
        const emptyLinks = brandingPlatforms.reduce(
            (acc, platform) => {
                acc[platform] = '';
                return acc;
            },
            {} as Record<string, string>,
        );

        const values = {
            name: profileInfo.name ?? '',
            description: profileInfo.description ?? '',
            links: {
                ...emptyLinks,
                ...profileInfo.links,
            },
        };

        return values;
    }, [profileInfo, brandingPlatforms]);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues,
        shouldUnregister: true,
    });

    const { control } = form;

    const onSubmit = async (data: FormValues) => {
        console.log(data);
        setLoading(true);

        try {
            await updatePublicProfileInfo(data);
            toast.success('Public profile updated successfully.');
            onEdit();
        } catch (error) {
            console.error('Error updating public profile info.');
        } finally {
            setLoading(false);
        }
    };

    const onError = (errors: any) => {
        console.log('Validation errors:', errors);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                <div className="col gap-2">
                    <InputWithLabel name="name" label="Name" placeholder="" />
                    <InputWithLabel name="description" label="Description" placeholder="None" />

                    <Label value="Links" />
                    {brandingPlatforms
                        .sort((a, b) => a.localeCompare(b))
                        .map((platform, index) => {
                            return (
                                <Controller
                                    key={index}
                                    name={`links.${platform}`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        return (
                                            <StyledInput
                                                placeholder={BRANDING_PLATFORM_NAMES[platform] ?? platform}
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value);
                                                }}
                                                onBlur={field.onBlur}
                                                isInvalid={!!fieldState.error}
                                                errorMessage={fieldState.error?.message}
                                            />
                                        );
                                    }}
                                />
                            );
                        })}

                    <div className="row mt-2 justify-between">
                        <Button
                            className="h-9 border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
                            color="default"
                            size="sm"
                            variant="solid"
                            onPress={() => setEditing(false)}
                        >
                            <div className="text-sm">Cancel</div>
                        </Button>

                        <Button className="h-9" type="submit" color="primary" size="sm" variant="solid" isLoading={isLoading}>
                            <div className="text-sm">Update profile</div>
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
