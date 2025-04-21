#!/bin/bash

set -euo pipefail

PROMPT="$1"
COMMIT_MSG="$2"
API_KEY="$3"

# Log what is being sent to OpenAI
echo "📝 Sending the following request to OpenAI:"
echo "----------------------------------------"
echo "Model: gpt-3.5-turbo-0125"
echo "System Message:"
echo "$PROMPT"
echo "User Message:"
echo "$COMMIT_MSG"
echo "----------------------------------------"


response=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
      --arg prompt "$PROMPT" \
      --arg commit_msg "$COMMIT_MSG" \
      '{
        "model": "gpt-3.5-turbo-0125",
        "messages": [
          {"role": "system", "content": $prompt},
          {"role": "user", "content": $commit_msg}
        ]
      }')")

echo "🔍 OpenAI response:"
echo "$response"

professional_msg=$(echo "$response" | jq -r '.choices[0].message.content')

if [ -z "$professional_msg" ] || [ "$professional_msg" = "null" ]; then
  echo "⚠️ OpenAI API returned an empty response. Falling back to commit message."
  professional_msg="$COMMIT_MSG"
fi

{
  echo "professional_msg<<EOF"
  echo "$professional_msg"
  echo "EOF"
} >> "$GITHUB_ENV"

echo "✅ OpenAI call completed!"
