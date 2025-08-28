import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';

function SubmitButton({
    label = 'Submit',
    icon,
    isLoading = false,
}: {
    label?: string;
    icon?: React.ReactNode;
    isLoading?: boolean;
}) {
    const [isVisible, setVisible] = useState(false);

    // Rendering is delayed because of a bug which triggers form validation otherwise
    useEffect(() => {
        const timeout = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            {isVisible && (
                <Button type="submit" color="primary" variant="solid" isLoading={isLoading}>
                    <div className="row gap-1.5">
                        {!!icon && <div className="text-lg">{icon}</div>}
                        <div className="compact">{label}</div>
                    </div>
                </Button>
            )}
        </>
    );
}

export default SubmitButton;
