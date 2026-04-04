#!/bin/bash
# ================================================
# SecureCodeReviews.com — MacBook Setup Script
# Run: chmod +x setup-mac.sh && ./setup-mac.sh
# ================================================

set -e

echo "🔧 SCR MacBook Setup"
echo "===================="

# 1. Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing via Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install node
else
    echo "✅ Node.js $(node -v)"
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Installing..."
    brew install git
else
    echo "✅ Git $(git -v)"
fi

# 2. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# 3. Check for .env.local
echo ""
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local found. Creating from template..."
    cat > .env.local << 'ENVEOF'
# ==============================================
# SecureCodeReviews.com — Environment Variables
# Fill in your actual values below
# ==============================================

# MongoDB Atlas
MONGODB_URI=mongodb+srv://abhishektiwaricdac:YOUR_PASSWORD_HERE@cluster0.hickzca.mongodb.net/scr?retryWrites=true&w=majority&appName=Cluster0

# NextAuth
NEXTAUTH_SECRET=M/eGp6POQPNwmWdfwDnwWw8hVOBaiRijEp0zhvWOF/g=
NEXTAUTH_URL=http://localhost:3000

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-JP9DY1ZHSD

# SMTP (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@securecodereviews.com
SMTP_PASSWORD=YOUR_SMTP_PASSWORD_HERE

# Admin
ADMIN_EMAIL=support@securecodereviews.com
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD_HERE

# Upstash Redis (optional — for rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ENVEOF
    echo ""
    echo "📝 Created .env.local with template values."
    echo "   ⚠️  UPDATE THESE VALUES before running the app:"
    echo "   - MONGODB_URI (your MongoDB Atlas password)"
    echo "   - SMTP_PASSWORD (your Hostinger email password)"
    echo "   - ADMIN_PASSWORD (your admin password)"
    echo ""
    echo "   You can copy actual values from Vercel Dashboard:"
    echo "   https://vercel.com → Your Project → Settings → Environment Variables"
else
    echo "✅ .env.local already exists"
fi

# 4. Build check
echo ""
echo "🔨 Running build check..."
npm run build

echo ""
echo "✅ Setup complete! Run the dev server with:"
echo "   npm run dev"
echo ""
echo "   Then open: http://localhost:3000"
