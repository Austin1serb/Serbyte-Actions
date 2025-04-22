import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs/promises";
import * as path from "path";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function run() {
  try {
    const openai = new OpenAI({apiKey: OPENAI_API_KEY});
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
    const model = core.getInput("openai-model") || "gpt-4o-mini";

    const commits = github.context.payload.commits ?? [];
    if (!commits.length) throw new Error("No commits in payload");

    // Load prompt and email template
    const [systemPrompt, emailTemplate] = await Promise.all([
      fs.readFile(path.join(__dirname, "prompt.md"), "utf8"),
      fs.readFile(path.join(__dirname, "email.html"), "utf8")
    ]);

    // Prepare commit messages
    const commitMessages = commits.map((c: any) => `- ${c.message.trim()}`).join("\n");

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {role: "system", content: systemPrompt},
        {role: "user", content: commitMessages}
      ]
    });

    const summary = completion?.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error("Empty OpenAI response");

    const repoName = github.context.repo.repo;

    // Fill {{BODY}} and {{REPO_NAME}} inside full email template
    const finalEmail = emailTemplate.replace("{{BODY}}", summary).replace("{{REPO_NAME}}", repoName);

    core.setOutput("email_body", finalEmail);
    core.notice("✅ Email body successfully generated.");
  } catch (error) {
    core.setFailed(`❌ ${error instanceof Error ? error.message : String(error)}`);
  }
}

run();
