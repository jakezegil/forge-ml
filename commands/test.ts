import type { Argv } from "yargs";
import test from "../controls/test";

const testCommand = (cli: Argv) =>
  cli.command(
    "test <schema-file>",
    "runs a prompt against a given schema to simulate a Forge endpoint",
    (yargs) =>
      yargs.positional("schema-file", {
        description: "The location of the file containing the zod schema to test against.",
        type: "string",
        demandOption: true,
      }),
    (args) => {
      test(args["schema-file"])
    }
  );

  export default testCommand;