#!/bin/bash

# API Test Script for Cardify Backend
# Usage: ./test-api.sh

API_URL="http://localhost:5001"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "======================================"
echo "🧪 Testing Cardify API Endpoints"
echo "======================================"
echo ""

# 1. Register User
echo "1️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": {"first": "Test", "middle": "", "last": "User"},
    "phone": "05-7654321",
    "email": "testuser'$(date +%s)'@test.com",
    "password": "Test123!@#",
    "address": {
      "country": "Israel",
      "city": "Tel Aviv",
      "street": "Test Street",
      "houseNumber": 1,
      "zip": 12345
    },
    "isBusiness": true
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "$REGISTER_RESPONSE"
fi
echo ""

# 2. Login
echo "2️⃣  Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Abc123!@#"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}✓ Login successful${NC}"
else
  echo -e "${RED}✗ Login failed${NC}"
fi
echo ""

# 3. Get All Cards
echo "3️⃣  Testing Get All Cards..."
CARDS_RESPONSE=$(curl -s -X GET $API_URL/cards)
if echo "$CARDS_RESPONSE" | grep -q '\['; then
  CARD_COUNT=$(echo "$CARDS_RESPONSE" | grep -o '"_id"' | wc -l)
  echo -e "${GREEN}✓ Got $CARD_COUNT cards${NC}"
else
  echo -e "${RED}✗ Failed to get cards${NC}"
fi
echo ""

# 4. Create Card (Business User)
echo "4️⃣  Testing Card Creation..."
CARD_RESPONSE=$(curl -s -X POST $API_URL/cards \
  -H "x-auth-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Card",
    "subtitle": "Test Subtitle",
    "description": "Test Description",
    "phone": "05-9876543",
    "email": "card@test.com",
    "web": "https://test.com",
    "address": {
      "country": "Israel",
      "city": "Tel Aviv",
      "street": "Test St",
      "houseNumber": 1,
      "zip": 12345
    }
  }')

if echo "$CARD_RESPONSE" | grep -q "bizNumber"; then
  echo -e "${GREEN}✓ Card created successfully${NC}"
  CARD_ID=$(echo "$CARD_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
else
  echo -e "${RED}✗ Card creation failed${NC}"
fi
echo ""

# 5. Get My Cards
echo "5️⃣  Testing Get My Cards..."
MY_CARDS=$(curl -s -X GET $API_URL/cards/my-cards \
  -H "x-auth-token: $TOKEN")

if echo "$MY_CARDS" | grep -q '\['; then
  echo -e "${GREEN}✓ Got user cards${NC}"
else
  echo -e "${RED}✗ Failed to get user cards${NC}"
fi
echo ""

# 6. Toggle Like
echo "6️⃣  Testing Card Like..."
LIKE_RESPONSE=$(curl -s -X PATCH $API_URL/cards/$CARD_ID \
  -H "x-auth-token: $TOKEN")

if echo "$LIKE_RESPONSE" | grep -q "liked"; then
  echo -e "${GREEN}✓ Card like toggled${NC}"
else
  echo -e "${RED}✗ Like toggle failed${NC}"
fi
echo ""

# 7. Update Card
echo "7️⃣  Testing Card Update..."
UPDATE_RESPONSE=$(curl -s -X PUT $API_URL/cards/$CARD_ID \
  -H "x-auth-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Card Title"}')

if echo "$UPDATE_RESPONSE" | grep -q "Updated Card Title"; then
  echo -e "${GREEN}✓ Card updated${NC}"
else
  echo -e "${RED}✗ Card update failed${NC}"
fi
echo ""

# 8. Delete Card
echo "8️⃣  Testing Card Deletion..."
DELETE_RESPONSE=$(curl -s -X DELETE $API_URL/cards/$CARD_ID \
  -H "x-auth-token: $TOKEN")

if echo "$DELETE_RESPONSE" | grep -q "deleted"; then
  echo -e "${GREEN}✓ Card deleted${NC}"
else
  echo -e "${RED}✗ Card deletion failed${NC}"
fi
echo ""

# 9. Update User Profile
echo "9️⃣  Testing User Update..."
UPDATE_USER=$(curl -s -X PUT $API_URL/users/$USER_ID \
  -H "x-auth-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "05-1111111"}')

if echo "$UPDATE_USER" | grep -q "05-1111111"; then
  echo -e "${GREEN}✓ User updated${NC}"
else
  echo -e "${RED}✗ User update failed${NC}"
fi
echo ""

# 10. Health Check
echo "🔟 Testing Health Check..."
HEALTH=$(curl -s -X GET $API_URL/health)
if echo "$HEALTH" | grep -q "OK"; then
  echo -e "${GREEN}✓ Server is healthy${NC}"
else
  echo -e "${RED}✗ Health check failed${NC}"
fi
echo ""

echo "======================================"
echo "🎉 API Testing Complete!"
echo "======================================"
