#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  S/R/E Platform — Vercel Deployment Script
#  Automates: CLI install → Auth → Link → Env vars → Deploy
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Color Palette ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Constants ──
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.production"
CREDENTIALS_FILE="$PROJECT_DIR/.turso-credentials"
VERCEL_PROJECT_NAME="sre-platform"

# ── Helper Functions ──
info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }
error()   { echo -e "${RED}❌ $1${NC}"; }
step()    { echo -e "\n${CYAN}${BOLD}──▶ $1 ──${NC}"; }

banner() {
  echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}   S/R/E Platform — Vercel Deployment${NC}"
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}\n"
}

# ── Pre-flight Checks ──
preflight() {
  step "Pre-flight checks"

  if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
    error "package.json not found in $PROJECT_DIR"
    exit 1
  fi

  if [[ ! -f "$PROJECT_DIR/vercel.json" ]]; then
    warn "vercel.json not found — default Vercel settings will be used"
  fi

  # Check for Turso credentials
  if [[ -f "$CREDENTIALS_FILE" ]]; then
    source "$CREDENTIALS_FILE"
    success "Turso credentials found from setup-turso.sh"
  elif [[ -f "$ENV_FILE" ]]; then
    # Try to extract from .env.production
    DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | sed 's/^DATABASE_URL="//' | sed 's/"$//')
    TURSO_AUTH_TOKEN=$(grep "^TURSO_AUTH_TOKEN=" "$ENV_FILE" | head -1 | sed 's/^TURSO_AUTH_TOKEN="//' | sed 's/"$//')

    if [[ -n "$DATABASE_URL" && "$DATABASE_URL" == libsql://* ]]; then
      success "Turso credentials found in .env.production"
    else
      warn "No Turso credentials found. Run scripts/setup-turso.sh first, or set manually."
      warn "You can also set environment variables later in the Vercel dashboard."
    fi
  else
    warn "No .env.production or .turso-credentials found."
    warn "Run scripts/setup-turso.sh first, or set environment variables manually in Vercel."
  fi
}

# ── Install Vercel CLI ──
install_vercel_cli() {
  step "Checking Vercel CLI"

  if command -v vercel &> /dev/null; then
    local version
    version=$(vercel --version 2>/dev/null || echo "unknown")
    success "Vercel CLI already installed ($version)"
    return 0
  fi

  info "Vercel CLI not found. Installing globally..."

  # Prefer npm, fallback to other package managers
  if command -v npm &> /dev/null; then
    npm install -g vercel
  elif command -v bun &> /dev/null; then
    bun install -g vercel
  elif command -v yarn &> /dev/null; then
    yarn global add vercel
  else
    error "No package manager found (npm/bun/yarn). Please install Node.js first."
    exit 1
  fi

  if command -v vercel &> /dev/null; then
    success "Vercel CLI installed successfully ($(vercel --version))"
  else
    error "Vercel CLI installation failed. Please install manually: npm i -g vercel"
    exit 1
  fi
}

# ── Authenticate with Vercel ──
auth_vercel() {
  step "Authenticating with Vercel"

  # Check if already authenticated
  if vercel whoami &> /dev/null 2>&1; then
    local username
    username=$(vercel whoami 2>/dev/null || echo "authenticated")
    success "Already authenticated with Vercel as: $username"
    return 0
  fi

  info "Opening browser for Vercel authentication..."
  info "If the browser doesn't open, follow the instructions in the terminal."
  vercel login

  if vercel whoami &> /dev/null 2>&1; then
    success "Authenticated with Vercel as: $(vercel whoami)"
  else
    error "Vercel authentication failed. Please run 'vercel login' manually."
    exit 1
  fi
}

# ── Link Project to Vercel ──
link_project() {
  step "Linking project to Vercel"

  cd "$PROJECT_DIR"

  # Check if already linked
  if [[ -f ".vercel/project.json" ]]; then
    local project_id
    project_id=$(grep -o '"orgId":"[^"]*"' .vercel/project.json 2>/dev/null | head -1 || echo "")
    if [[ -n "$project_id" ]]; then
      success "Project already linked to Vercel"
      return 0
    fi
  fi

  info "Linking project to Vercel..."
  info "When prompted, choose the following:"
  info "  • Set up and deploy? ${BOLD}Y${NC}"
  info "  • Which scope? ${BOLD}Your account${NC}"
  info "  • Link to existing project? ${BOLD}N${NC} (first time) or ${BOLD}Y${NC} (if re-deploying)"
  info "  • Project name: ${BOLD}$VERCEL_PROJECT_NAME${NC}"
  info "  • Framework: ${BOLD}Next.js${NC}"
  info ""

  vercel link --yes 2>&1 || {
    # If --yes doesn't work, try interactive
    warn "Automatic linking failed. Trying interactive mode..."
    vercel link
  }

  if [[ -f ".vercel/project.json" ]]; then
    success "Project linked to Vercel successfully"
  else
    error "Failed to link project to Vercel"
    exit 1
  fi
}

# ── Set Environment Variables ──
set_env_vars() {
  step "Setting environment variables in Vercel"

  cd "$PROJECT_DIR"

  # Collect env values
  local db_url=""
  local turso_token=""
  local nextauth_secret=""
  local nextauth_url=""

  # Source credentials if available
  if [[ -f "$CREDENTIALS_FILE" ]]; then
    source "$CREDENTIALS_FILE"
    db_url="$DATABASE_URL"
    turso_token="$TURSO_AUTH_TOKEN"
  fi

  # Try from .env.production
  if [[ -z "$db_url" && -f "$ENV_FILE" ]]; then
    db_url=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | sed 's/^DATABASE_URL="//' | sed 's/"$//')
    turso_token=$(grep "^TURSO_AUTH_TOKEN=" "$ENV_FILE" | head -1 | sed 's/^TURSO_AUTH_TOKEN="//' | sed 's/"$//')
  fi

  # Prompt for missing values
  if [[ -z "$db_url" || "$db_url" == *"your-db-name"* ]]; then
    echo -e "\n${YELLOW}Enter your Turso DATABASE_URL (libsql://...):${NC} "
    read -r db_url
  fi

  if [[ -z "$turso_token" || "$turso_token" == *"your-turso"* ]]; then
    echo -e "\n${YELLOW}Enter your TURSO_AUTH_TOKEN:${NC} "
    read -r turso_token
  fi

  # Generate NEXTAUTH_SECRET
  if command -v openssl &> /dev/null; then
    nextauth_secret=$(openssl rand -base64 32)
    success "Generated NEXTAUTH_SECRET: ${nextauth_secret:0:10}...${nextauth_secret: -5}"
  else
    # Fallback: generate a pseudo-random secret
    nextauth_secret="sre-$(date +%s)-$RANDOM$RANDOM$RANDOM"
    warn "openssl not found. Using fallback NEXTAUTH_SECRET (please regenerate with openssl later)"
  fi

  # Determine NEXTAUTH_URL
  nextauth_url="https://$VERCEL_PROJECT_NAME.vercel.app"
  echo -e "\n${YELLOW}Enter your NEXTAUTH_URL (default: $nextauth_url):${NC} "
  read -r input_url
  if [[ -n "$input_url" ]]; then
    nextauth_url="$input_url"
  fi

  # Set environment variables in Vercel (production environment)
  info "Setting environment variables in Vercel..."

  local env_vars_set=0

  # DATABASE_URL
  if [[ -n "$db_url" ]]; then
    vercel env add DATABASE_URL production <<< "$db_url" 2>/dev/null || {
      # If the variable already exists, remove and re-add
      vercel env rm DATABASE_URL production -y 2>/dev/null || true
      vercel env add DATABASE_URL production <<< "$db_url" 2>/dev/null || {
        warn "Could not set DATABASE_URL via CLI. Set it manually in the Vercel dashboard."
      }
    }
    ((env_vars_set++)) || true
  fi

  # TURSO_AUTH_TOKEN
  if [[ -n "$turso_token" ]]; then
    vercel env add TURSO_AUTH_TOKEN production <<< "$turso_token" 2>/dev/null || {
      vercel env rm TURSO_AUTH_TOKEN production -y 2>/dev/null || true
      vercel env add TURSO_AUTH_TOKEN production <<< "$turso_token" 2>/dev/null || {
        warn "Could not set TURSO_AUTH_TOKEN via CLI. Set it manually in the Vercel dashboard."
      }
    }
    ((env_vars_set++)) || true
  fi

  # NEXTAUTH_SECRET
  vercel env add NEXTAUTH_SECRET production <<< "$nextauth_secret" 2>/dev/null || {
    vercel env rm NEXTAUTH_SECRET production -y 2>/dev/null || true
    vercel env add NEXTAUTH_SECRET production <<< "$nextauth_secret" 2>/dev/null || {
      warn "Could not set NEXTAUTH_SECRET via CLI. Set it manually in the Vercel dashboard."
    }
  }
  ((env_vars_set++)) || true

  # NEXTAUTH_URL
  vercel env add NEXTAUTH_URL production <<< "$nextauth_url" 2>/dev/null || {
    vercel env rm NEXTAUTH_URL production -y 2>/dev/null || true
    vercel env add NEXTAUTH_URL production <<< "$nextauth_url" 2>/dev/null || {
      warn "Could not set NEXTAUTH_URL via CLI. Set it manually in the Vercel dashboard."
    }
  }
  ((env_vars_set++)) || true

  # Also set for preview and development environments
  info "Setting environment variables for preview environment..."
  for var_name in DATABASE_URL TURSO_AUTH_TOKEN NEXTAUTH_SECRET; do
    local var_value=""
    case "$var_name" in
      DATABASE_URL) var_value="$db_url" ;;
      TURSO_AUTH_TOKEN) var_value="$turso_token" ;;
      NEXTAUTH_SECRET) var_value="$nextauth_secret" ;;
    esac
    if [[ -n "$var_value" ]]; then
      vercel env add "$var_name" preview <<< "$var_value" 2>/dev/null || true
    fi
  done

  # Update local .env.production with actual values
  cat > "$ENV_FILE" <<EOF
# Turso Database (cloud SQLite)
DATABASE_URL="$db_url"
TURSO_AUTH_TOKEN="$turso_token"

# NextAuth Configuration
NEXTAUTH_SECRET="$nextauth_secret"
NEXTAUTH_URL="$nextauth_url"
EOF

  success "Environment variables configured ($env_vars_set production vars set)"
}

# ── Build Check ──
build_check() {
  step "Running local build check"

  cd "$PROJECT_DIR"

  info "Installing dependencies..."
  if command -v bun &> /dev/null; then
    bun install 2>&1 | tail -3
  else
    npm install 2>&1 | tail -3
  fi

  info "Generating Prisma client..."
  npx prisma generate 2>&1 | tail -3

  info "Running Next.js build..."
  if command -v bun &> /dev/null; then
    bun run build 2>&1 | tail -20
  else
    npm run build 2>&1 | tail -20
  fi

  if [[ $? -eq 0 ]]; then
    success "Local build succeeded — safe to deploy"
  else
    warn "Local build had issues. Proceed with deployment? (y/N)"
    read -r proceed
    if [[ "$proceed" != "y" && "$proceed" != "Y" ]]; then
      error "Deployment cancelled"
      exit 1
    fi
  fi
}

# ── Deploy to Production ──
deploy() {
  step "Deploying to Vercel production"

  cd "$PROJECT_DIR"

  info "Deploying... (this may take a few minutes)"
  local deploy_output
  deploy_output=$(vercel --prod 2>&1)

  if [[ $? -eq 0 ]]; then
    success "Deployment successful!"
    echo "$deploy_output"
  else
    error "Deployment failed"
    echo "$deploy_output"
    exit 1
  fi

  # Extract deployment URL
  DEPLOY_URL=$(echo "$deploy_output" | grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' | head -1 || echo "")

  if [[ -n "$DEPLOY_URL" ]]; then
    # Save deployment URL
    echo "$DEPLOY_URL" > "$PROJECT_DIR/.last-deploy-url"
  fi
}

# ── Output Summary ──
output_summary() {
  local deploy_url="${DEPLOY_URL:-}"

  if [[ -z "$deploy_url" && -f "$PROJECT_DIR/.last-deploy-url" ]]; then
    deploy_url=$(cat "$PROJECT_DIR/.last-deploy-url")
  fi

  echo -e "\n${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${GREEN}   Vercel Deployment Complete! 🚀${NC}"
  echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}\n"

  if [[ -n "$deploy_url" ]]; then
    echo -e "${BOLD}Production URL:${NC}     $deploy_url"
  fi
  echo -e "${BOLD}Vercel Dashboard:${NC}   https://vercel.com/dashboard"
  echo -e "${BOLD}Project Name:${NC}       $VERCEL_PROJECT_NAME"
  echo -e ""
  echo -e "${YELLOW}${BOLD}Next Steps:${NC}"
  echo -e "  1. Visit your deployment URL and verify the app loads"
  echo -e "  2. Run ${CYAN}scripts/seed-production.sh${NC} to seed the production database"
  echo -e "  3. Test the admin login at ${CYAN}/login${NC}"
  echo -e "  4. Check the health endpoint: ${CYAN}${deploy_url:-<your-url>}/api/health${NC}"
  echo -e ""
  echo -e "${YELLOW}${BOLD}⚠️  Important:${NC}"
  echo -e "  • Make sure to change the admin password after first login"
  echo -e "  • Review all environment variables in the Vercel dashboard"
  echo -e "  • Set up a custom domain in Vercel if needed"
}

# ── Main ──
main() {
  banner
  preflight
  install_vercel_cli
  auth_vercel
  link_project
  set_env_vars
  build_check
  deploy
  output_summary
}

# Allow skipping steps via flags
SKIP_BUILD=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build) SKIP_BUILD=true; shift ;;
    --env-only)   set_env_vars; output_summary; exit 0 ;;
    --deploy-only) deploy; output_summary; exit 0 ;;
    --help|-h)
      echo "Usage: $0 [--skip-build] [--env-only] [--deploy-only] [--help]"
      echo ""
      echo "  --skip-build    Skip the local build check before deploying"
      echo "  --env-only      Only set environment variables, don't deploy"
      echo "  --deploy-only   Only deploy (assumes env vars are already set)"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *) error "Unknown option: $1"; exit 1 ;;
  esac
done

main
