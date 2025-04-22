"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const email_html_1 = __importDefault(require("./email.html"));
const prompt_md_1 = __importDefault(require("./prompt.md"));
const openai_1 = __importDefault(require("openai"));
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
async function run() {
    try {
        const openai = new openai_1.default({ apiKey: OPENAI_API_KEY });
        if (!OPENAI_API_KEY)
            throw new Error("OPENAI_API_KEY is not set");
        const model = core.getInput("openai-model") || "gpt-4o-mini";
        const commits = github.context.payload.commits ?? [];
        if (!commits.length)
            throw new Error("No commits in payload");
        // Prepare commit messages
        const commitMessages = commits.map((c) => `- ${c.message.trim()}`).join("\n");
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model,
            messages: [
                { role: "system", content: prompt_md_1.default },
                { role: "user", content: commitMessages }
            ]
        });
        const summary = completion?.choices?.[0]?.message?.content?.trim();
        if (!summary)
            throw new Error("Empty OpenAI response");
        const repoName = github.context.repo.repo;
        // Fill {{BODY}} and {{REPO_NAME}} inside full email template
        const finalEmail = email_html_1.default.replace("{{BODY}}", summary).replace("{{REPO_NAME}}", repoName);
        core.setOutput("email_body", finalEmail);
        core.notice("✅ Email body successfully generated.");
    }
    catch (error) {
        core.setFailed(`❌ ${error instanceof Error ? error.message : String(error)}`);
    }
}
run();
