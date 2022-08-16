const { defineConfig } = require("cypress");
const { rmdir, existsSync } = require("fs");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        deleteFolder(folderName) {
          console.log("deleting folder %s", folderName);
          return new Promise((resolve, reject) => {
            if (existsSync(folderName)) {
              rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
                if (err) {
                  console.error(err);
                  return reject(err);
                }
                resolve(null);
              });
            } else {
              resolve("Folder already deleted");
            }
          });
        },
      });
    },
    baseUrl: "http://localhost:3000",
  },
});
