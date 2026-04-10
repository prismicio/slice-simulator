import { version } from "../../package.json"

const div = (content: string) =>
	`<div style="word-spacing: initial; white-space: pre; line-height: initial; font-family: monospace; color: #ffffff; mix-blend-mode: difference; padding: 1rem; font-size: 1rem;">${content}</div>`

const a = (href: string, label?: string) =>
	`<a href="${href}" style="text-decoration: underline;">${label || href}<a>`

const header =
	`   _____ ___          _____ _                 __      __            \n  / ___// (_)_______ / ___/(_)___ ___  __  __/ /___ _/ /_____  _____\n  \\__ \\/ / / ___/ _ \\\\__ \\/ / __ \`__ \\/ / / / / __ \`/ __/ __ \\/ ___/\n ___/ / / / /__/  __/__/ / / / / / / / /_/ / / /_/ / /_/ /_/ / /    \n/____/_/_/\\___/\\___/____/_/_/ /_/ /_/\\__,_/_/\\__,_/\\__/\\____/_/     \n                  / /_  __  __   / __ \\_____(_)________ ___  (_)____\n                 / __ \\/ / / /  / /_/ / ___/ / ___/ __ \`__ \\/ / ___/\n                / /_/ / /_/ /  / ____/ /  / (__  ) / / / / / / /__  \n               /_.___/\\__, /  /_/   /_/  /_/____/_/ /_/ /_/_/\\___/  \n                     /____/   v${version}\n\n`

const footer = "\n\n\n\n                                                - The Prismic team"

export const sliceSimulatorAccessedDirectly = div(
`${header}



You're seeing this page because you're accessing Slice simulator
directly, e.g:

  - ${a("http://localhost:3000/slice-simulator")}



The Slice simulator can only be accessed through Slice Machine or
your repository.



If you believe this is an error, please reach out to us:

  - ${a("https://github.com/prismicio/slice-simulator/issues/new/choose")}



${footer}`,
)
