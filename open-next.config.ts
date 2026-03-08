// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const cloudflareConfig = defineCloudflareConfig({});

export default {
	...cloudflareConfig,
	build: {
		...(cloudflareConfig.build || {}),
		external: ["@swc/core", "@swc/wasm", "@swc/core-win32-x64-msvc"]
	},
	edgeResolve: {
		...(cloudflareConfig.edgeResolve || {}),
		external: ["@swc/core", "@swc/wasm", "@swc/core-win32-x64-msvc"]
	}
};
