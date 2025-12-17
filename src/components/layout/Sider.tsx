import Logo from '@assets/logo.svg';
import { environment } from '@lib/config';
import NetworkAndStatus from '@shared/NetworkAndStatus';
import { getAssetUrl } from '@lib/assets/getAssetUrl';
import Navigation from './Navigation';

function Sider() {
    const logoSrc = getAssetUrl(Logo);

    return (
        <div className="col w-sider-sm xl:w-sider fixed top-0 bottom-0 left-0 m-4 justify-between rounded-xl bg-slate-100 px-4 py-8 xl:px-6 xl:py-12">
            <div className="col gap-8">
                <div className="center-all">
                    <img src={logoSrc} alt="Logo" className="h-7" />
                </div>

                <Navigation />
            </div>

            <div className="col gap-2.5 text-center">
                <div className="pt-1">
                    <NetworkAndStatus />
                </div>

                <div className="compact text-center text-slate-500">{environment}</div>
            </div>
        </div>
    );
}

export default Sider;
