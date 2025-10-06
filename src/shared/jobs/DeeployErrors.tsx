import DeeployAlert from './DeeployAlert';

export default function DeeployErrors({
    type,
    errors,
}: {
    type: 'deployment' | 'update';
    errors: { text: string; serverAlias: string }[];
}) {
    if (!errors.length) {
        return null;
    }

    return (
        <DeeployAlert
            type="error"
            title={
                <div>
                    <span className="capitalize">{type}</span> failed with the following error{errors.length > 1 ? 's' : ''}:
                </div>
            }
            items={errors}
        />
    );
}
