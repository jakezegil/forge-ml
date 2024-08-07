import { importConfig, importZod } from "../utils/imports";
import { toJSON } from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";
import { cWrap } from "../utils/logging";
import { config as cfg } from "../config/config";
import { CacheType, SchemaConfig } from "../utils/config";
import { loadDirectoryFiles } from "../utils/directory";
import { generate } from "./generate";
import fs from "fs";
import axios from "axios";

/**
 * helper functions to check latest version of npm package
 */

async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://registry.npmjs.org/${packageName}`
    );
    return response.data["dist-tags"].latest;
  } catch (error) {
    throw new Error(`Failed to fetch package info: ${error}`);
  }
}

async function checkVersionAndWarnUser() {
  try {
    //gets current version in users project package.json and removes ^  -- needs to be tested in production
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const version = packageJson.dependencies["forge-ml"];
    if (version === undefined) {
      //checks if forge-ml is it package.json dependencies
      return;
    }
    const currentVersion = version.replace(/^\^/, ""); // removes carrot from version string
    const latestVersion = await getLatestVersion("forge-ml");

    if (currentVersion !== latestVersion) {
      console.log(
        cWrap.fm(
          `You are using an outdated version of forge-ml. Please update to the latest version: ${latestVersion} by running:`
        ) + cWrap.fg("npm install forge-ml@latest")
      );
    }
  } catch (e) {
    console.log(cWrap.fr("Error checking for updates"));
  }
}

const deploy = async (
  inFile: string,
  endpoint: string,
  config: SchemaConfig
) => {
  const zod = await importZod(inFile);
  const json = toJSON(zod);

  const response = await makeRequest(EP.DEPLOY, {
    method: "POST",
    data: {
      name: config.name || "Set me in the schema config (name)",
      description:
        config.description || "Set me in the schema config (description)",
      structure: JSON.stringify(json),
      path: endpoint,
      public: config.public,
      cacheSetting: config.cache || CacheType.NONE,
      contentType: config.contentType,
      model: config.model,
    },
  });

  if (response.error) {
    if (response.message === "Model does not support images") {
      //used to handle error gracefully
      return {
        error: true,
        message: response.message,
      };
    }

    console.log(cWrap.br("Error deploying"));
    console.log(cWrap.fr(response?.message as string));
  }

  return response;
};

const deployAll = async () => {
  //check for npm package updates and inform user - WORKS IN DEV TEST IN PRODUCTION
  await checkVersionAndWarnUser();

  const files = loadDirectoryFiles();

  for (const file of files) {
    const filePath = path.join(process.cwd(), cfg.schemaPath, file);
    const config = await importConfig(filePath);

    if (!config?.path) {
      console.log(
        `- ${cWrap.fm("No path found")} in ${cWrap.fg(file)}. Skipping...`
      );
      continue;
    }

    if (file.includes(".ignore.")) {
      console.log(`- ${cWrap.fm("Ignoring")} ${cWrap.fg(file)}. Skipping...`);
      continue;
    }

    try {
      const response = await deploy(filePath, config.path, config);
      if (response.error) {
        if (response.message === "Model does not support images") {
          console.log(
            "- " +
              cWrap.fr(
                "Error deploying endpoint: " +
                  config.path +
                  ". '" +
                  config.model +
                  "' does not support images"
              )
          );
          continue; // check if should be return
        }

        console.log(
          `- ${cWrap.fr("Error deploying")} ${cWrap.fm(
            file
          )}. Something went wrong. Are you logged in?`
        );
      } else {
        console.log(
          `- ${cWrap.fg("Deployed")} ${cWrap.fg(file)} to ${cWrap.fg(
            config.path
          )}`
        );
      }
    } catch (error) {
      console.log(
        `- ${cWrap.fr("Error deploying")} ${cWrap.fm(
          file
        )}. Please check that you have a valid zodSchema as the default export. Skipping...`
      );
    }
  }

  generate();
};

export { deploy, deployAll };
