#!/bin/bash

# Define the API endpoint
API_URL="http://localhost:5000/register"

# Define the test user data
USERNAME="testuser"
PASSWORD="testpass"

# Send a POST request to the API
response=$(curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

# Print the response
echo "Response from API:"
echo "$response"
