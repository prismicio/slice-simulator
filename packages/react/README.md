<!--

Replace all on all files (README.md, CONTRIBUTING.md, bug_report.md, package.json):
- @prismicio/slice-simulator-react
- Preview and develop Prismic slices fast with minimal configuration
- prismicio/slice-simulator
- slice-simulator

-->

# @prismicio/slice-simulator-react

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Conventional Commits][conventional-commits-src]][conventional-commits-href]
[![License][license-src]][license-href]

Preview and develop [Prismic][prismic] slices fast with minimal configuration.

- 🛠 &nbsp;Minimal configuration;
- 🖥 &nbsp;Preview and develop slices locally;
- 🈂 &nbsp;Compatible with [React][react].

## Install

```bash
npm install @prismicio/slice-simulator-react
```

Then create a page for Slice Simulator:
```jsx
// e.g. ~/pages/slice-simulator.jsx
import * as React from "react";
import { SliceSimulator } from "@prismicio/slice-simulator-react";
import SliceZone from "next-slicezone";

import _state from "../.slicemachine/libraries-state.json";
import resolver from  "../sm-resolver";

const SliceSimulatorPage = () => {
	const [state, setState] = React.useState(_state);

	// If using Webpack, add the following mounted hook for full HMR support:
	if (module.hot) {
		// Path should be the same as your libraries state import
		module.hot.accept("../.slicemachine/libraries-state.json", () => {
			setState(_state);
		});
	}

	// If using Vite, add the following mounted hook for full HMR support:
	// if (import.meta.hot) {
	// 	// Path should be the same as your libraries state import
	// 	import.meta.hot.accept("../.slicemachine/libraries-state.json", (m) => {
	// 		setState(m.default);
	// 	});
	// }
	
	return (<SliceSimulator
		// The `sliceZone` prop should be a function receiving slices and rendering them using your `SliceZone` component.
		sliceZone={({ slices }) => <SliceZone slices={slices} resolver={resolver} />}
		state={state}
	/>);
}

export default SliceSimulatorPage;
```

## Documentation

To discover what's new on this package check out [the changelog][changelog]. For full documentation, visit the [official Prismic documentation][prismic-docs].

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a pull request][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

For more clarity on this project and its structure you can also check out the detailed [CONTRIBUTING.md][contributing] document.

## License

```
   Copyright 2013-2021 Prismic <contact@prismic.io> (https://prismic.io)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

<!-- Links -->

[prismic]: https://prismic.io

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs
[changelog]: ./CHANGELOG.md
[contributing]: ./CONTRIBUTING.md
[react]: https://reactjs.org

<!-- TODO: Replace link with a more useful one if available -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio/slice-simulator/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio/slice-simulator/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio/slice-simulator/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@prismicio/slice-simulator-react/latest.svg
[npm-version-href]: https://npmjs.com/package/@prismicio/slice-simulator-react
[npm-downloads-src]: https://img.shields.io/npm/dm/@prismicio/slice-simulator-react.svg
[npm-downloads-href]: https://npmjs.com/package/@prismicio/slice-simulator-react
[github-actions-ci-src]: https://github.com/prismicio/slice-simulator/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/prismicio/slice-simulator/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio/slice-simulator.svg
[codecov-href]: https://codecov.io/gh/prismicio/slice-simulator
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/@prismicio/slice-simulator-react.svg
[license-href]: https://npmjs.com/package/@prismicio/slice-simulator-react
