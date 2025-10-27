import { getShortAddressOrHash } from '@lib/utils';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { SmallTag } from '@shared/SmallTag';
import toast from 'react-hot-toast';

export default function JobFileVolumesSection({ obj }: { obj: Record<string, { content: string; mounting_point: string }> }) {
    const handleDownloadFile = (fileName: string, content: string) => {
        const sanitizedFileName = fileName
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^\w.-]/g, '');

        const finalFileName = sanitizedFileName.length > 0 ? sanitizedFileName : 'downloaded_file';

        try {
            const fileBlob = new Blob([content]);
            const downloadUrl = URL.createObjectURL(fileBlob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = finalFileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);

            toast.success('File downloaded successfully.', {
                duration: 2000,
            });
        } catch (error) {
            toast.error('Failed to download file.');
        }
    };

    return (
        <div className="col mt-1 gap-1">
            {Object.entries(obj).map(([key, value]) => (
                <div key={key} className="row font-roboto-mono gap-1">
                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">NAME</div>
                            <div>{key}</div>
                        </div>
                    </SmallTag>

                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">PATH</div>
                            <div>{getShortAddressOrHash(value.mounting_point, 16, true)}</div>
                        </div>
                    </SmallTag>

                    <ContextMenuWithTrigger
                        items={[
                            {
                                key: 'copy',
                                label: 'Copy file contents',
                                onPress: async () => {
                                    try {
                                        await navigator.clipboard.writeText(value.content);
                                        toast.success('File contents copied to clipboard.', {
                                            duration: 2000,
                                        });
                                    } catch (error) {
                                        toast.error('Failed to copy file contents to clipboard.');
                                    }
                                },
                            },
                            {
                                key: 'download',
                                label: 'Download file',
                                onPress: () => {
                                    handleDownloadFile(key, value.content);
                                },
                            },
                        ]}
                    />
                </div>
            ))}
        </div>
    );
}
