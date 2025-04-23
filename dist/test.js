"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assets_1 = require("./assets");
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
function mockRun() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
            // Mock commits
            const commits = [{ message: "fixed mobile nav bug" }, { message: "updated FAQ section" }, { message: "added checkout validation" }];
            // Create user content
            const commitMessages = commits.map(c => `- ${c.message.trim()}`).join("\n");
            // Hit OpenAI
            const completion = yield openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: assets_1.systemPrompt },
                    { role: "user", content: commitMessages }
                ]
            });
            const summary = (_d = (_c = (_b = (_a = completion === null || completion === void 0 ? void 0 : completion.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim();
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
    });
}
mockRun();
