import fs from "fs";
import { nodeOutput } from "./nodeLogger.mjs";

/**
 * This script remove the homepage property from package.json that was set by electronPreBuild.mjs
 * This script is called at the end of the build process for electron.
 * Electron requires the homepage attribute to be set to "./" but the website needs the homepage
 * attribute to be "/" or empty (because netlify will assume this value as default).
 * The reason for this is that electron uses the HashRouter but the browser uses the BrowserRouter.
 * It is possible to also use the HashRouter for the website but then the url will
 * always include "/#/" which I don't personally like.
 */

await start();

async function start() {
  let error;

  //Get file content, add homepage attribute and write to filesystem
  try {
    const content = await fs.promises.readFile("../../package.json", "utf8");
    const toJSON = await JSON.parse(content);

    //delete homepage prop from object
    delete toJSON.homepage;

    //write file to fs
    fs.promises.writeFile("../../package.json", JSON.stringify(toJSON, null, "  "));
  } catch (e) {
    nodeOutput.error(e.message);
    error = true;
  }

  //Show info message
  if (!error) {
    nodeOutput.info("Removed homepage prop from package.json");
  } else {
    nodeOutput.error("Failed to remove homepage prop from package.json");
  }
}
