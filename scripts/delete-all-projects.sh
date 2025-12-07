#!/bin/bash

# Delete all projects from DynamoDB to clear invalid enum values
# This script finds the Project table and deletes all items

echo "🔍 Finding Project table..."

# Get the table name
TABLE_NAME=$(aws dynamodb list-tables --region eu-central-1 --query "TableNames[?contains(@, 'Project')]" --output text | grep -v "ProjectBrief" | head -1)

if [ -z "$TABLE_NAME" ]; then
  echo "❌ Could not find Project table"
  exit 1
fi

echo "📋 Found table: $TABLE_NAME"
echo ""
echo "⚠️  WARNING: This will DELETE ALL projects from the database!"
echo "Press Ctrl+C to cancel, or press Enter to continue..."
read

echo ""
echo "🗑️  Deleting all projects..."

# Scan and delete all items
aws dynamodb scan --table-name "$TABLE_NAME" --region eu-central-1 \
  --projection-expression "id" \
  --query "Items[*].id.S" \
  --output text | tr '\t' '\n' | while read -r project_id; do
    if [ -n "$project_id" ]; then
      echo "Deleting project: $project_id"
      aws dynamodb delete-item \
        --table-name "$TABLE_NAME" \
        --key "{\"id\": {\"S\": \"$project_id\"}}" \
        --region eu-central-1
    fi
done

echo ""
echo "✅ All projects deleted!"
echo "You can now create new projects with the updated schema."
