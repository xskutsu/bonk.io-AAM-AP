import { spawn } from "child_process";
import { join } from "path";

const projectRoot = process.cwd();

const esbuildProcess = spawn("node", [join(projectRoot, "scripts", "esbuild.cjs"), "--watch"], {
	stdio: "inherit"
});
const serverProcess = spawn("node", [join(projectRoot, "scripts", "serve.mjs")], {
	stdio: "inherit"
});

function cleanup() {
	esbuildProcess.kill();
	serverProcess.kill();
	process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);