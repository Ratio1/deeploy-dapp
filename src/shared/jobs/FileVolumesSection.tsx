import { Button } from '@heroui/button';
import { useCallback, useRef, useState } from 'react';

export default function FileVolumesSection() {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setFileName(null);
            setError(null);
            return;
        }

        try {
            const textContent = await file.text();
            console.log('[FileVolumesSection] Uploaded file content:', textContent);
            setFileName(file.name);
            setError(null);
        } catch (err) {
            console.error('[FileVolumesSection] Failed to read file content:', err);
            setFileName(null);
            setError('Unable to read the selected file. Please try again.');
        } finally {
            // Reset the input so the same file can be uploaded twice in a row if needed.
            event.target.value = '';
        }
    }, []);

    const handleButtonClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return (
        <div className="col gap-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="volume-file-input">
                Import volume definition file
            </label>

            <input
                ref={inputRef}
                id="volume-file-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
            />

            <Button color="primary" variant="flat" onPress={handleButtonClick} className="w-fit">
                Choose File
            </Button>

            {fileName && (
                <div className="text-xs text-slate-500">Loaded file: {fileName}</div>
            )}

            {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
    );
}
