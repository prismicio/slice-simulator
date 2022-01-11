const pkg = require("./package.json");

module.exports = pkg.workspaces
	.map(workspace => {
		const pkg = require(`./${workspace}/package.json`);

		return [pkg.module, pkg.main].filter(Boolean).map(file => `./${workspace}/${file}`);
	})
	.flat()
	.map(path => ({ path }));
