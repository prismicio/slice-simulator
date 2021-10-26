import fs from "fs";
import path from "path";
import url from "url";

import { mkdist } from "mkdist";

const run = async () => {
	const writtenFiles = [];

	writtenFiles.push(...(await mkdist({ format: "cjs" })).writtenFiles);

	writtenFiles.push(
		...(
			await mkdist({
				format: "mjs",
				declaration: true,
				cleanDist: false,
			})
		).writtenFiles,
	);

	const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
	fs.renameSync(
		path.join(__dirname, "dist/index.js"),
		path.join(__dirname, "dist/index.cjs"),
	);

	console.info(
		writtenFiles
			.map((f) => `- ${f.replace("index.js", "index.cjs")}`)
			.join("\n"),
	);

	process.exit(0);
};

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
