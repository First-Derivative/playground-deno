#!/usr/bin/env deno run --allow-all
import { parse } from "https://deno.land/std@0.184.0/flags/mod.ts";

interface Arguments {
  p: string;
  package?: string;
  _: string[];
}

const inputArgs: Arguments = parse(Deno.args);

export const checkBrewTS = async (defaultArg?: string) => {
  if (!inputArgs.p || inputArgs.p === "")
    if (inputArgs.package) inputArgs.p === inputArgs.package;
    else if (inputArgs._.length > 0) inputArgs.p = inputArgs._[0];
    else if (defaultArg) inputArgs.p === defaultArg;
    else {
      console.log("missing <package>");
      console.log("alternatively you can supply a -p or --package flag and then the package name");
      return null;
    }

  const check = Deno.run({
    cmd: ["brew", "info", inputArgs.p],
    stdout: "piped",
    stderr: "piped",
  });

  const [status, stdout, stderr] = await Promise.all([check.status(), check.output(), check.stderrOutput()]);
  check.close();

  // console.log(`status: ${status}, stdout: ${stdout}, stderr: ${stderr}`);

  const output = new TextDecoder().decode(stdout);

  if (output === "==> Searching for a previously deleted formula (in the last month)...\n") return false;

  const installed = !output.includes("Not installed");
  return installed;
};

const output = await checkBrewTS();
if (output !== null) console.log(output);
