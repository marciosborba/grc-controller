#!/bin/bash

# Config
URL="https://myxvxponlmulnjstbjwd.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4"
LINK="NDk3YWFkZjQtMDE1_mj0o2p2d"

echo "Testing RPC via REST API..."
curl -X POST "$URL/rest/v1/rpc/get_public_assessment_data" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d "{ \"p_link\": \"$LINK\" }" \
  -v
