#!/usr/bin/env bash
# reusable-workflows/commit-emailer/call_openai.sh
set -euo pipefail

PROMPT_FILE="${PROMPT_FILE:?PROMPT_FILE env var not set}"
COMMIT_MSG="$1"    # first arg
API_KEY="$2"       # second arg

# Actually send the request
response=$(
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { 
        "role": "developer", 
        "content": "$PROMPT_FILE"
      },
      { 
        "role": "user", 
        "content": "$COMMIT_MSG"
      }
    ]
  }')

echo "🔍 OpenAI Response:"
echo "$response"

# Extract message
professional_msg=$(jq -r '.choices[0].message.content' <<< "$response")

if [[ -z "$professional_msg" || "$professional_msg" == "null" ]]; then
  echo "⚠️ OpenAI returned an empty message — falling back to commit message."
  professional_msg="$COMMIT_MSG"
fi

# Export into GitHub Actions
{
  echo "professional_msg<<EOF"
  echo "$professional_msg"
  echo "EOF"
} >> "$GITHUB_ENV"

echo "✅ OpenAI call completed successfully!"
