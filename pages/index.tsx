import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {FaSync} from "react-icons/fa";
import Button from "components/controls/Button";
import TextField from "components/controls/TextField";
import Layout from "components/layout/Layout";
import { WclConsumeData, WclReport } from "lib/WclTypes";
import ColorUtils from "lib/colors";
import dayjs from "dayjs";

const HomePage = (): JSX.Element => {

    return (
        <Layout>
            <p>Go to Configuration to enter your API key if you haven&apos;t already</p>
            <p>Then go to the Logs page to get started</p>
        </Layout>
    )
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
