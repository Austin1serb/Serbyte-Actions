import * as fs from "fs/promises";
import * as path from "path";

async function embed() {
  const emailTemplatePath = path.resolve(__dirname, "../src/email.html");
  const promptPath = path.resolve(__dirname, "../src/prompt.md");

  const emailTemplate = await fs.readFile(emailTemplatePath, "utf8");
  const prompt = await fs.readFile(promptPath, "utf8");

  const out = `
/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY. */

export const emailTemplate = ${JSON.stringify(emailTemplate)};
export const systemPrompt = ${JSON.stringify(prompt)};
`;

  await fs.writeFile(path.resolve(__dirname, "../src/assets.ts"), out.trimStart(), "utf8");

  console.log("✅ Embedded static assets successfully.");
}

embed().catch(err => {
  console.error("❌ Failed to embed assets:", err);
  process.exit(1);
});
