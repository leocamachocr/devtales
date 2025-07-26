import { execSync } from "child_process";
import { writeFileSync } from "fs";

console.log("📦 Building...");
execSync("npm run build", { stdio: "inherit" });

console.log("📄 Creating .nojekyll...");
writeFileSync("dist/.nojekyll", "");

console.log("🚀 Deploying to GitHub Pages...");
execSync("npx gh-pages -d dist --dotfiles", { stdio: "inherit" });

console.log("✅ Deploy complete!");
