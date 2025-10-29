import { Button } from '@heroui/button';
import { uploadProfileImage } from '@lib/api/backend';
import { resizeImage } from '@lib/utils';
import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export default function ImageUpload({
    onSuccessfulUpload,
    setImageLoading,
}: {
    onSuccessfulUpload: () => void;
    setImageLoading: (loading: boolean) => void;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            setImageLoading(true);

            let file: File | undefined = event.target.files?.[0];

            if (!file) {
                return;
            }

            // Check if file extension is allowed
            const fileName = file.name.toLowerCase();
            const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

            if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
                toast.error('Only .jpg, .jpeg, and .png images are allowed.');
                setImageLoading(false);
                event.target.value = '';
                return;
            }

            if (file.size > 50_000) {
                const resizedBlob = await resizeImage(file);
                console.log('Resized size (KB):', resizedBlob.size / 1024);
                file = new File([resizedBlob], file.name, { type: 'image/jpeg' });
            }

            try {
                await uploadProfileImage(file);
                onSuccessfulUpload();

                // Takes into account the response time of the image request
                setTimeout(() => {
                    toast.success('Profile image updated successfully.');
                }, 500);
            } catch (err) {
                console.error('Profile image upload failed:', err);
                toast.error('Failed to upload profile image.');
                setImageLoading(false);
            } finally {
                // Reset the input so the same file can be uploaded twice in a row if needed
                event.target.value = '';
            }
        },
        [onSuccessfulUpload],
    );

    const handleButtonClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return (
        <div className="row gap-2.5">
            <input
                ref={inputRef}
                id="image-input"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
            />

            <Button
                className="h-9 border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
                color="default"
                size="sm"
                variant="solid"
                onPress={handleButtonClick}
            >
                <div className="text-sm">Upload image...</div>
            </Button>
        </div>
    );
}
