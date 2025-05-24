import { defineConfig } from "cypress";
import { rmdir, existsSync } from "fs";
import path from "path";

export default defineConfig({
  projectId: "fdc7av",
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        deleteFolder,
      });
    },
    baseUrl: "http://localhost:3000",
    defaultBrowser: "chrome",
  },

  component: {
    defaultBrowser: "chrome",
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        server: {
          host: true,
          port: 3000,
        },
        build: {
          outDir: "build", // Changed output folder, like in CRA
        },
        resolve: {
          alias: {
            "@components": path.resolve(__dirname, "src/components"),
            "@hooks": path.resolve(__dirname, "src/hooks"),
          },
        },
      },
    },
    setupNodeEvents(on, config) {
      on("task", {
        deleteFolder,
      });
    },
  },
});

function deleteFolder(folderName: string) {
  return new Promise((resolve, reject) => {
    if (existsSync(folderName)) {
      rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
        if (err) {
          console.error(`\x1b[31mFailed to delete folder ${folderName}: ${err.message}\x1b[0m`);
          return reject("Failed to delete folder");
        }
        console.info(`\x1b[34mFolder ${folderName} deleted successfully\x1b[0m`);
        resolve("Folder deleted");
      });
    } else {
      console.info(`\x1b[34mFolder ${folderName} does not exist\x1b[0m`);
      resolve("Folder does not exist");
    }
  });
}
