import { exec } from "child_process";

export default function (cmd: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    exec(cmd, function (err, stdout) {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}
