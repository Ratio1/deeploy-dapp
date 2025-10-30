import { useEffect } from 'react';
import PluginsSection from '../plugins/PluginsSection';

export default function Plugins() {
    // Init
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return <PluginsSection />;
}
