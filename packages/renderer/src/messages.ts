const div = (content: string) =>
	`<div style="word-spacing: initial; white-space: pre; line-height: initial; font-family: monospace; padding: 1rem; font-size: 1rem;">${content}</div>`;

const a = (href: string, label?: string) =>
	`<a href="${href}" style="text-decoration: underline;">${label || href}<a>`;

const header =
	"   _____ ___           ______                                       \n  / ___// (_)_______  / ____/___ _____ _   ______ ______            \n  \\__ \\/ / / ___/ _ \\/ /   / __ `/ __ \\ | / / __ `/ ___/            \n ___/ / / / /__/  __/ /___/ /_/ / / / / |/ / /_/ (__  )             \n/____/_/_/\\___/\\___/\\____/\\__,_/_/_/_/|___/\\__,_/____/        _     \n                  / /_  __  __   / __ \\_____(_)________ ___  (_)____\n                 / __ \\/ / / /  / /_/ / ___/ / ___/ __ `__ \\/ / ___/\n                / /_/ / /_/ /  / ____/ /  / (__  ) / / / / / / /__  \n               /_.___/\\__, /  /_/   /_/  /_/____/_/ /_/ /_/_/\\___/  \n                     /____/\n\n";

const footer =
	"\n\n\n\n\n\n                                                - The Prismic team";

export const sliceCanvasAccessedDirectly = div(
	[
		header,
		`You're seeing this page because you're accessing Slice Canvas\ndirectly, e.g:\n\n  - ${a(
			"http://localhost:3000/_canvas",
		)}\n\n\n\nSlice Canvas is not meant to be accessed this way, to preview your\nslices, head over to Slice Machine UI:\n\n  - ${a(
			"http://localhost:9999",
		)}\n\n\n\nIf you believe this is an error, please reach out to us:\n\n  - ${a(
			"https://github.com/prismicio/slice-machine/issues/new/choose",
		)}`,
		footer,
	].join(""),
);
