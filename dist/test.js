"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assets_1 = require("./assets");
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
async function mockRun() {
    try {
        const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
        // Mock commits
        const commits = [{ message: "fixed mobile nav bug" }, { message: "updated FAQ section" }, { message: "added checkout validation" }];
        // Create user content
        const commitMessages = commits.map(c => `- ${c.message.trim()}`).join("\n");
        // Hit OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: assets_1.systemPrompt },
                { role: "user", content: commitMessages }
            ]
        });
        console.log(completion);
        const summary = completion?.choices?.[0]?.message?.content?.trim();
        if (!summary)
            throw new Error("Empty OpenAI response");
        const repoName = "automedicskirkland";
        // Fill {{BODY}} and {{REPO_NAME}} inside full email template
        const finalEmail = assets_1.emailTemplate.replace("{{BODY}}", summary).replace(/{{REPO_NAME}}/g, repoName);
        // Instead of core.setOutput, just log it
        console.log("🔥 FINAL EMAIL:");
        console.log(finalEmail);
    }
    catch (error) {
        console.error("❌ Test run failed:", error);
    }
}
mockRun();
