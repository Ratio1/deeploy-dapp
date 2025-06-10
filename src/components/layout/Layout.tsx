import Content from './Content';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd]">
            <div className="hidden layoutBreak:block">
                <Sider />
            </div>

            <div className="relative mb-[76px] min-h-dvh w-full py-6 layoutBreak:mb-0 layoutBreak:ml-[270px] layoutBreak:py-10 lg:py-12">
                <Content />
            </div>

            <div className="block layoutBreak:hidden">
                {/* TODO: */}
                {/* <MobileTabs /> */}
            </div>
        </div>
    );
}

export default Layout;
