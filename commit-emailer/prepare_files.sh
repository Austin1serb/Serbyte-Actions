#!/bin/bash

set -euo pipefail


WORKFLOW_DIR="reusable-workflows/commit-emailer"

if [ "$1" = "load_prompt" ]; then
  # Use jq to properly escape the entire file content as a JSON string
  if command -v jq &> /dev/null; then
    PROMPT_FILE=$(cat "$WORKFLOW_DIR/prompt.md")
    ESCAPED_PROMPT=$(echo "$PROMPT_FILE" | jq -Rs .)
    # Remove the surrounding quotes that jq adds
    ESCAPED_PROMPT="${ESCAPED_PROMPT:1:-1}"
    echo "PROMPT_FILE=$ESCAPED_PROMPT" >> "$GITHUB_ENV"
    echo "✅ Prompt loaded into environment!"
    echo "Using jq for proper JSON escaping"
  else
    # Fallback to a more comprehensive sed approach if jq is not available
    PROMPT_FILE=$(cat "$WORKFLOW_DIR/prompt.md")
    ESCAPED_PROMPT=$(printf '%s\n' "$PROMPT_FILE" | sed 's/[\"]/\\&/g; s/[\/]/\\\//g; s/[\b]/\\b/g; s/[\f]/\\f/g; s/[\n]/\\n/g; s/[\r]/\\r/g; s/[\t]/\\t/g')
    echo "PROMPT_FILE=$ESCAPED_PROMPT" >> "$GITHUB_ENV"
    echo "✅ Prompt loaded into environment!"
    echo "Using sed for escaping (jq not available)"
  fi
  exit
fi

elif [ "$1" == "prepare_email" ]; then
  PROFESSIONAL_MSG="$2"

  # Prepare Email Template
  EMAIL_TEMPLATE=$(cat "$WORKFLOW_DIR/email.html")
  ESCAPED_MSG=$(printf '%s\n' "$PROFESSIONAL_MSG" | sed 's/[\/&]/\\&/g')
  FINAL_EMAIL=${EMAIL_TEMPLATE//"{{PROFESSIONAL_MSG}}"/"$ESCAPED_MSG"}

  echo "$FINAL_EMAIL" > email_ready.html

  echo "✅ email_ready.html successfully created!"
else
  echo "❌ Invalid argument. Use 'load_prompt' or 'prepare_email'."
  exit 1
fi
