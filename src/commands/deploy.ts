import type { Argv } from "yargs";
import { deploy, deployAll } from "../controls/deploy";
import { importConfig } from "../utils/imports";
import path from "path";
import cWrap from "../utils/logging";
import authGate from "../utils/authGate";

const deployCommand = (cli: Argv) =>
  cli.command(
    "deploy <filename>",
    cWrap.fm("Deploy a schema to the Forge API. You can optionally override the path by passing in the --path flag."),
    (yargs) =>
      yargs
        .positional("filename", {
          description: cWrap.fg(
            `The filename of the schema to deploy. This is the name of the file that contains the schema. \`deploy all\` to deploy all schemas in the forge/ directory.`
          ),
          type: "string",
          default: "all",
        })
        .option("path", {
          description:
            "the path to deploy the schema to. This will override the path specified by the exported config. Only alphanumeric characters are valid.",
          type: "string",
        })
        .example(
          "deploy all",
          `Deploy all schemas in the ${cWrap.fg("forge/")} directory`
        )
        .example(
          "deploy forge/mySchema.ts",
          `Deploy the schema in the ${cWrap.fg(
            "forge/"
          )} directory with the name mySchema`
        ),
    async (args) => {
      authGate();

      if (args.filename === "all") {
        await deployAll();
        return;
      }

      const file = path.join(process.cwd(), args.filename);

      const endpoint = args.path || (await importConfig(file)).path;

      if (!endpoint) {
        console.log("No path found. Please provide a path or filename.");
        return;
      }

      const response = await deploy(file, endpoint);

      console.log(response)

      if (response.error) {
        console.error("Whoops! Looks like something went wrong.");
        process.exit(1);
      } else {
        console.log(`Deployed schema to ${cWrap.fg(response.data.url)}`);
      }
    }
  );

export default deployCommand;