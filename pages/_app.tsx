/** @format */

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AnimatePresence } from "framer-motion";

//COMPONENTS
import Layout from "../components/Layout";

//SWR
import { SWRConfig } from "swr";
import axios from "axios";
import { useRouter } from "next/router";

//STYLED COMPONETNS
import { ThemeProvider } from "styled-components";
import ApartTheme from "../styles/theme/ApartTheme";
import GlobalStyle from "../styles/global";

function handleExitComplete() {
	if (typeof window !== "undefined") {
		window.scrollTo({ top: 0 });
	}
}

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	return (
		<ThemeProvider theme={ApartTheme}>
			<GlobalStyle />
			<SWRConfig
				value={{
					refreshInterval: 3000,
					fetcher: (url: string) => axios.get(url).then((res) => res.data),
				}}
			>
				<Layout>
					{/* <AnimatePresence exitBeforeEnter onExitComplete={handleExitComplete}> */}
					<Component {...pageProps} key={router.route} />
					{/* </AnimatePresence> */}
				</Layout>
			</SWRConfig>
		</ThemeProvider>
	);
}

export default MyApp;
