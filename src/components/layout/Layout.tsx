import Content from './Content';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-light">
            <div className="hidden layoutBreak:block">
                <Sider />
            </div>

            <div className="relative mb-[76px] min-h-dvh w-full py-6 layoutBreak:mb-0 layoutBreak:ml-sider-with-padding layoutBreak:py-10 lg:py-12">
                <Content />
            </div>
        </div>
    );
}

export default Layout;
