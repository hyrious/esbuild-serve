import { build, createServer } from ".";

const { argv } = process;
function testArgv(...flags: string[]) {
  return argv.some((arg) => flags.includes(arg.toLowerCase()));
}

if (testArgv("--build", "-b")) {
  build();
} else {
  createServer();
}
