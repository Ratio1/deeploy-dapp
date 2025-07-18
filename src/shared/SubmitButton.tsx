import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';

function SubmitButton({ label = 'Submit', isLoading = false }: { label?: string; isLoading?: boolean }) {
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
                    <div>{label}</div>
                </Button>
            )}
        </>
    );
}

export default SubmitButton;
