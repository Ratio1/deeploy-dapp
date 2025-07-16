import Logo from '@assets/logo.svg';
import Content from './Content';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-light">
            <Sider />

            <div className="ml-small-sider-with-padding relative hidden min-h-dvh w-full py-6 md:py-10 lg:block lg:py-12 larger:ml-sider-with-padding">
                <Content />
            </div>

            <div className="lg:hidden">
                <div className="center-all col fixed bottom-0 left-0 right-0 top-0 gap-6 bg-slate-50 p-8">
                    <div className="center-all">
                        <img src={Logo} alt="Logo" className="h-6" />
                    </div>

                    <div className="text-center">
                        Please switch to the <span className="font-medium">desktop</span> version
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Layout;
