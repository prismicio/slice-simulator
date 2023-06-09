import type { AppProps } from "next/app";

import "@/assets/style.css";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
	return <Component {...pageProps} />;
}
