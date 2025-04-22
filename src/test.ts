import * as fs from "fs/promises";
import * as path from "path";
import OpenAI from "openai";
import "dotenv/config";

async function mockRun() {
  try {
    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    // Mock commits
    const commits = [{message: "fixed mobile nav bug"}, {message: "updated FAQ section"}, {message: "added checkout validation"}];

    // Load system prompt
    const promptPath = path.join(__dirname, "prompt.md");
    const systemPrompt = await fs.readFile(promptPath, "utf8");

    // Load email template
    const emailTemplatePath = path.join(__dirname, "email.html");
    const emailTemplate = await fs.readFile(emailTemplatePath, "utf8");

    // Create user content
    const commitMessages = commits.map(c => `- ${c.message.trim()}`).join("\n");

    // Hit OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: systemPrompt},
        {role: "user", content: commitMessages}
      ]
    });

    const summary = completion?.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error("Empty OpenAI response");

    const repoName = "automedicskirkland";

    // Final email

    // Fill {{BODY}} and {{REPO_NAME}} inside full email template
    const finalEmail = emailTemplate.replace("{{BODY}}", summary).replace("{{REPO_NAME}}", repoName);

    // Instead of core.setOutput, just log it
    console.log("🔥 FINAL EMAIL:");
    console.log(finalEmail);
  } catch (error) {
    console.error("❌ Test run failed:", error);
  }
}

mockRun();
