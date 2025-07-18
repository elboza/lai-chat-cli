#!/bin/bash

# Step 1: Request device code
echo "Requesting device code..."
response=$(curl -s -X POST 'https://github.com/login/device/code' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  -d '{"client_id": "Iv1.b507a08c87ecfe98", "scope": "read:user"}')

device_code=$(echo $response | jq -r '.device_code')
user_code=$(echo $response | jq -r '.user_code')
verification_uri=$(echo $response | jq -r '.verification_uri')
interval=$(echo $response | jq -r '.interval')

echo "device_code: ${device_code} , user_code: ${user_code}"

echo "Please go to $verification_uri and enter the code: $user_code"
echo "Waiting for authorization..."

# Step 2: Poll for access token
while true; do
  token_response=$(curl -s -X POST 'https://github.com/login/oauth/access_token' \
    -H 'accept: application/json' \
    -H 'content-type: application/json' \
    -d '{"client_id": "Iv1.b507a08c87ecfe98", "device_code": "'$device_code'", "grant_type": "urn:ietf:params:oauth:grant-type:device_code"}')

  access_token=$(echo $token_response | jq -r '.access_token')
  error=$(echo $token_response | jq -r '.error')

  if [ "$access_token" != "null" ]; then
    echo "Access token received."
	echo "access_token: ${access_token}"
    break
  elif [ "$error" == "authorization_pending" ]; then
    sleep $interval
  else
    echo "Error: $error"
    exit 1
  fi
done

# Step 3: Get Copilot token
copilot_token_response=$(curl -s -X GET 'https://api.github.com/copilot_internal/v2/token' \
  -H 'authorization: token '$access_token)

copilot_token=$(echo $copilot_token_response | jq -r '.token')

echo "Copilot token: $copilot_token"

