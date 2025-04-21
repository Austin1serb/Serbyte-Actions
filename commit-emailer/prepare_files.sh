#!/bin/bash

set -euo pipefail


WORKFLOW_DIR="reusable-workflows/commit-emailer"

if [ "$1" == "load_prompt" ]; then
  # Load the prompt into environment
  {
    echo "prompt<<END_OF_PROMPT"
    cat "$WORKFLOW_DIR/prompt.md"
    echo "END_OF_PROMPT"
  } >> "$GITHUB_ENV"

  echo "✅ Prompt loaded into environment!"

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
