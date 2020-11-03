/** @format */

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { useStore } from "../store";

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
	const store = useStore(pageProps.initialReduxState);
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
				<Provider store={store}>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</Provider>
			</SWRConfig>
		</ThemeProvider>
	);
}

export default MyApp;
