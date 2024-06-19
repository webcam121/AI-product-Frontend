import type { ReactNode } from 'react';

import { AppConfig } from '@/utils/AppConfig';

type IMainProps = {
    meta?: ReactNode;
    children: ReactNode;
};

const Main = (props: IMainProps) => (
    <div className="w-full font-poppins">
        {props.meta}
        <div className="w-full bg-[#6944FF] h-[38px] flex justify-center items-center md:flex xs:hidden">
            <span className={'text-white ml-1 text-center text-[15px] font-normal'}>Save your favourite AI’s for <span className={'font-semibold'}>FREE</span> 🤗</span>
        </div>
        <div className="mx-auto w-full bg-[#1F1D2B] px-5">

            <main className="content py-5 text-xl xs: pt-0">{props.children}</main>

            <footer className="border-t border-[#40465F] py-8 text-center text-sm text-[#7C829B]">
                © Copyright {new Date().getFullYear()} {AppConfig.title}. Made with{' '}
                <a href="https://meetbeagle.com">MeetBeagle</a>
            </footer>
        </div>
    </div>
);

export { Main };