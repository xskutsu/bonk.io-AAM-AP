import { readFile } from "fs";
import { createServer } from "http";
import { join } from "path";

const PORT = 3001;
const FILE_PATH = join(process.cwd(), "dist", "aam-ap.user.js");

const server = createServer((req, res) => {
	if (req.url === "/" || req.url === "/aam-ap.user.js") {
		readFile(FILE_PATH, "utf8", (err, data) => {
			if (err) {
				res.writeHead(500, {
					"Content-Type": "text/plain"
				});
				res.end("Error loading userscript");
				console.error(err);
				return;
			}
			res.writeHead(200, {
				"Content-Type": "application/javascript",
				"Cache-Control": "no-cache"
			});
			res.end(data);
		});
	} else {
		res.writeHead(404, {
			"Content-Type": "text/plain"
		});
		res.end("Not found");
	}
});

server.listen(PORT, () => {
	console.log(`Userscript server running at http://localhost:${PORT}/`);
});