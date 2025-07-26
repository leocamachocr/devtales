// deploy.js
import { execSync } from "child_process";
import { writeFileSync } from "fs";

console.log("Building...");
execSync("npm run build", { stdio: "inherit" });

console.log("Creating .nojekyll...");
writeFileSync("dist/.nojekyll", "");

console.log("Deploying...");
execSync("npx gh-pages -d dist", { stdio: "inherit" });

console.log("✅ Done");
