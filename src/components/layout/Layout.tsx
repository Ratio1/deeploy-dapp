import Logo from '@assets/logo.svg';
import Content from './Content';
import FloatingNavigation from './FloatingNavigation';
import Sider from './Sider';

function Layout() {
    return (
        <div className="bg-light flex min-h-dvh items-stretch">
            <div className="hidden xl:block">
                <Sider />
            </div>

            <div className="xl:ml-sider-with-padding relative mb-[88px] hidden min-h-dvh w-full py-10 lg:block lg:py-12 xl:mb-0">
                <Content />

                <div className="xl:hidden">
                    <FloatingNavigation />
                </div>
            </div>

            <div className="lg:hidden">
                <div className="center-all col fixed top-0 right-0 bottom-0 left-0 gap-6 bg-slate-50 p-8">
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
