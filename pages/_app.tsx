import { AppProps } from "next/dist/shared/lib/router/router";
import { ReactNode } from "react";
import "../styles/app.css";
import { LogContextProvider } from "lib/useLog";
import { ConfigContextProvider } from "lib/useConfig";

function MyApp({ Component, pageProps }: AppProps): ReactNode {
    return (
        <>
            <ConfigContextProvider>
                <LogContextProvider initialValue={{}}>
                    <Component {...pageProps} />
                </LogContextProvider>
            </ConfigContextProvider>
        </>
    );
}

export default MyApp;
