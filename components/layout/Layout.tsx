import React, { ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/dist/client/router";
import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: ReactNode }): JSX.Element => {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [router]);

    return (
        <>
            <Head>
                <title>SPLAT</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex w-full min-h-screen">
                <Sidebar open={menuOpen} />
                <main className="pt-4 px-4 min-h-mobilemain md:min-h-main bg-neutral-900 text-white flex-grow">
                    <div className="-m-4 h-12 mb-4 pt-2 border-b border-white border-opacity-20">
                        <h1 className="text-2xl text-center">
                            Selmek&apos;s Poggin Log Analysis Tool (SPLAT)
                        </h1>
                    </div>
                    <div
                        className="container mx-auto"
                        style={{
                            height: "calc(100% - 4rem)",
                        }}
                    >
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
};

export default Layout;
