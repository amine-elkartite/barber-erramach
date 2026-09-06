import { spawn } from "node:child_process";
const children = ["server", "client"].map((workspace) =>
  spawn("npm", ["run", "dev", "-w", workspace], { stdio: "inherit" }),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    children.forEach((child) => child.kill(signal));
    process.exit();
  });
