import { join } from "https://deno.land/std/path/mod.ts";

// Get the current directory - equivalent to __dirname in Node.js
const root = new URL(".", import.meta.url).pathname;

// Get platform-specific EOL
const EOL = Deno.build.os === "windows" ? "\r\n" : "\n";

interface DialogConfig {
  type: "directory" | "save-file" | "open-file" | "open-files";
}

function askdialog(config: DialogConfig): Promise<string[]> {
  let cmd = join("python", "dist");
  
  if (Deno.build.os === "linux") {
    let filename = "node-file-dialog";
    if (Deno.build.arch === "x86") filename += "-xi686.AppImage";
    else filename += "-x86_64.AppImage";
    cmd = join(cmd, "linux", filename);
  }
  
  if (Deno.build.os === "windows") {
    let filename = "dialog";
    if (Deno.build.arch === "x86") filename += "-x86";
    cmd = join(cmd, "windows", filename + ".exe");
  }
  
  const fullPath = join(root, cmd);
  let args: string[] = [];
  
  // Set command arguments based on config type
  if (config.type === "directory") {
    args.push("-d");
  } else if (config.type === "save-file") {
    args.push("-s");
  } else if (config.type === "open-file") {
    args.push("-o");
  } else if (config.type === "open-files") {
    args.push("-f");
  }
  
  return new Promise((resolve, reject) => {
    const command = new Deno.Command(fullPath, {
      args: args,
    });
    
    command.output()
      .then(output => {
        const stdout = new TextDecoder().decode(output.stdout);
        const stderr = new TextDecoder().decode(output.stderr);
        
        if (stdout) {
          if (stdout.trim() === "None") {
            reject(new Error("Nothing selected"));
          } else {
            resolve(stdout.trim().split(EOL));
          }
        } else if (stderr) {
          reject(new Error(stderr));
        } else if (output.code !== 0) {
          reject(new Error(`Process exited with code ${output.code}`));
        }
      })
      .catch(error => {
        reject(new Error(String(error)));
      });
  });
}

export default askdialog;
