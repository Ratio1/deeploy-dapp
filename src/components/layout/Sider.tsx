import Logo from '@assets/logo.svg';
import NetworkAndStatus from '@shared/NetworkAndStatus';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="col w-small-sider fixed bottom-0 left-0 top-0 m-4 justify-between rounded-xl bg-slate-100 px-6 pb-12 pt-12 xl:w-sider">
            <div className="col gap-8">
                <div className="center-all">
                    <img src={Logo} alt="Logo" className="h-7" />
                </div>

                <Navigation />
            </div>

            <div className="col text-center">
                <div className="pt-1">
                    <NetworkAndStatus />
                </div>
            </div>
        </div>
    );
}

export default Sider;
