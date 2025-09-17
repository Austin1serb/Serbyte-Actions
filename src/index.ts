import * as core from "@actions/core";
import * as github from "@actions/github";

import {emailTemplate, systemPrompt} from "./assets";
import {OpenAI} from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function run() {
  try {
    const openai = new OpenAI({apiKey: OPENAI_API_KEY});
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
    const model = core.getInput("openai-model") || "gpt-4o-mini";

    const commits = github.context.payload.commits ?? [];
    if (!commits.length) throw new Error("No commits in payload");

    // Prepare commit messages
    const commitMessages = commits.map((c: any) => `- ${c.message.trim()}`).join("\n");

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {role: "system", content: systemPrompt},
        {role: "user", content: commitMessages}
      ]
    });

    const summary = completion?.choices?.[0]?.message?.content?.trim();

    if (!summary) throw new Error("Empty OpenAI response");

    const repoName = github.context.repo.repo;

    // Fill {{BODY}} and {{REPO_NAME}} inside full email template
    const finalEmail = emailTemplate.replace("{{BODY}}", summary).replace(/{{REPO_NAME}}/g, repoName);
    core.notice(`finalEmail: ${finalEmail}`);

    core.setOutput("email_body", finalEmail);
    core.notice("✅ Email body successfully generated.");
  } catch (error) {
    if (error instanceof Error) {
      core.error(`❌ Error message: ${error.message}`);
      if ("response" in error) {
        const err = error as any;
        core.error(`🔁 OpenAI response error: ${JSON.stringify(err.response?.data, null, 2)}`);
      }
      core.setFailed("🔥 Action failed — check above for full error trace.");
    } else {
      core.setFailed(`🔥 Unknown error: ${String(error)}`);
    }
    core.setFailed(`🔥 Unknown error: ${String(error)}`);
  }
}

run();
