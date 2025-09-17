import fs from "fs";
import axios from "axios";
import { exec } from "child_process";

async function generateModelTypes() {
	try {
		const folderSource = "./src/models";

		const generateFiles = (response, sourcePath = folderSource) => {
			if (sourcePath.includes("database")) return;
			if (!fs.existsSync(sourcePath)) {
				fs.mkdirSync(sourcePath);
			}
			Object.keys(response).forEach((key) => {
				const content = response[key];
				const fullPath = sourcePath + "/" + key;
				// file
				if (typeof content === "string") {
					fs.writeFileSync(fullPath, content, {
						encoding: "utf-8",
					});
				} else {
					generateFiles(content, fullPath);
				}
			});
		};
		const response = (
			await axios.get("http://localhost:3001/api/development/types")
		).data;
		// const response = (await axios.get('http://192.168.1.23:3005/development/types')).data;
		console.log("*******response *****");

		generateFiles(response);
		exec(`npx prettier ${folderSource} --write`, (err) => {
			if (err) {
				console.error("could not execute command: ", err);
				return;
			}
		});
	} catch (error) {
		console.error("error", error);
	}
}
// generateLanguageKeysType();
generateModelTypes();
