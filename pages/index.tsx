import Layout from "components/layout/Layout";

const HomePage = (): JSX.Element => {
    return (
        <Layout>
            <div className="grid place-items-center h-96">
                <div className="flex flex-col gap-4 w-1/2 justify-center">
                    <h1 className="text-center">
                        <span className="text-[3rem] text-green-500 font-bold">S</span>elmek&apos;s
                        <span className="text-[3rem] text-green-500 font-bold">P</span>oggin
                        <span className="text-[3rem] text-green-500 font-bold">L</span>og
                        <span className="text-[3rem] text-green-500 font-bold">A</span>nalysis
                        <span className="text-[3rem] text-green-500 font-bold">T</span>ool
                    </h1>
                    <p>
                        I have no idea why I took the time to build this. It&apos;s kind of like a
                        simpler, slower, worse version of warcraft logs.
                    </p>
                    <p>
                        To get started, go to the configuration page and add your WarcraftLogs API
                        key, then add a log.
                    </p>
                    <p>
                        Once you load a log, you will be able to begin processing it to get
                        information about consume and bomb usage, as well as various per-fight
                        metrics.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;

/*
//Leaving this here so that I don't have to keep looking up the syntax...
import { GetServerSidePropsContext } from "next/types";
export async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<{ props: any }> {
    return {
        props: {  },
    };
}
*/
