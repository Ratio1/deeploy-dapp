import { Button } from '@heroui/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function TextFileUpload({ onUpload, error }: { onUpload: (content: string) => void; error?: string }) {
    const [fileName, setFileName] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setErrorMessage(error);
    }, [error]);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setFileName(undefined);
            return;
        }

        if (file.size > 1_048_576) {
            const message = 'File size must not exceed 1 MB.';
            toast.error(message);
            setFileName(undefined);
            event.target.value = '';
            return;
        }

        try {
            const content = await file.text();
            onUpload(content);
            setFileName(file.name);
            setErrorMessage(undefined);
        } catch (err) {
            console.error('[FileVolumesSection] Failed to read file content:', err);
            setFileName(undefined);
        } finally {
            // Reset the input so the same file can be uploaded twice in a row if needed
            event.target.value = '';
        }
    }, []);

    const handleButtonClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return (
        <div className="row gap-2.5">
            <input ref={inputRef} id="volume-file-input" type="file" onChange={handleFileChange} className="hidden" />

            <Button
                className="rounded-lg border-1 border-slate-200 bg-white px-3 hover:opacity-70!"
                // className="h-[36px] bg-slate-200 hover:opacity-70!"
                color="primary"
                variant="flat"
                onPress={handleButtonClick}
            >
                <div className="compact">Choose File</div>
            </Button>

            {fileName && <div className="compact text-slate-500 italic">{fileName}</div>}

            {error && <div className="text-danger text-sm">{errorMessage}</div>}
        </div>
    );
}
