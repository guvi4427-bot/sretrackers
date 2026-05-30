#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  S/R/E Platform — Turso Database Setup Script
#  Automates: CLI install → DB creation → Credentials → Prisma push
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Color Palette ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Constants ──
DB_NAME="sre-platform"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.production"
ENV_LOCAL_FILE="$PROJECT_DIR/.env.local"
CREDENTIALS_FILE="$PROJECT_DIR/.turso-credentials"

# ── Helper Functions ──
info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }
error()   { echo -e "${RED}❌ $1${NC}"; }
step()    { echo -e "\n${CYAN}${BOLD}──▶ $1 ──${NC}"; }

banner() {
  echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}   S/R/E Platform — Turso Database Setup${NC}"
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}\n"
}

cleanup() {
  if [[ -f "$CREDENTIALS_FILE" ]]; then
    rm -f "$CREDENTIALS_FILE"
  fi
}
trap cleanup EXIT

# ── Pre-flight Checks ──
preflight() {
  step "Pre-flight checks"

  if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
    error "package.json not found in $PROJECT_DIR"
    error "Make sure you're running this from the project root or scripts/ directory"
    exit 1
  fi

  if [[ ! -f "$PROJECT_DIR/prisma/schema.prisma" ]]; then
    error "prisma/schema.prisma not found"
    exit 1
  fi

  success "Project structure verified"
}

# ── Install Turso CLI ──
install_turso_cli() {
  step "Checking Turso CLI"

  if command -v turso &> /dev/null; then
    local version
    version=$(turso --version 2>/dev/null || echo "unknown")
    success "Turso CLI already installed ($version)"
    return 0
  fi

  info "Turso CLI not found. Installing..."

  # Detect OS
  local install_cmd
  if [[ "$(uname -s)" == "Darwin" ]]; then
    if command -v brew &> /dev/null; then
      install_cmd="brew install chiselstrike/tap/turso"
    else
      install_cmd='curl -sSfL https://get.tur.so/install.sh | bash'
    fi
  elif [[ "$(uname -s)" == "Linux" ]]; then
    install_cmd='curl -sSfL https://get.tur.so/install.sh | bash'
  else
    error "Unsupported OS. Please install Turso CLI manually: https://docs.turso.tech/cli/installation"
    exit 1
  fi

  info "Running: $install_cmd"
  eval "$install_cmd"

  # Refresh PATH in case turso was installed to ~/.turso
  export PATH="$HOME/.turso:$PATH"

  if command -v turso &> /dev/null; then
    success "Turso CLI installed successfully ($(turso --version))"
  else
    error "Turso CLI installation failed. Please install manually and re-run."
    exit 1
  fi
}

# ── Authenticate with Turso ──
auth_turso() {
  step "Authenticating with Turso"

  # Check if already authenticated
  if turso auth whoami &> /dev/null 2>&1; then
    local account
    account=$(turso auth whoami 2>/dev/null | head -1 || echo "authenticated")
    success "Already authenticated with Turso ($account)"
    return 0
  fi

  info "Opening browser for Turso authentication..."
  info "If the browser doesn't open, copy the URL from the terminal."
  turso auth login

  if turso auth whoami &> /dev/null 2>&1; then
    success "Authenticated with Turso successfully"
  else
    error "Authentication failed. Please run 'turso auth login' manually and re-run."
    exit 1
  fi
}

# ── Create Turso Database ──
create_database() {
  step "Creating Turso database: $DB_NAME"

  # Check if database already exists
  if turso db list 2>/dev/null | grep -q "^$DB_NAME\b"; then
    warn "Database '$DB_NAME' already exists. Using existing database."
    return 0
  fi

  # Choose region — default to closest
  info "Creating database in the closest available region..."
  if turso db create "$DB_NAME" --enable-wal 2>&1; then
    success "Database '$DB_NAME' created successfully"
  else
    error "Failed to create database '$DB_NAME'"
    error "You may need to choose a different name or check your Turso account limits."
    exit 1
  fi

  # Wait for database to be ready
  info "Waiting for database to be ready..."
  sleep 5
}

# ── Get Database URL and Auth Token ──
get_credentials() {
  step "Retrieving database credentials"

  # Get database URL
  local db_url
  db_url=$(turso db show "$DB_NAME" --url 2>/dev/null | tr -d '[:space:]')

  if [[ -z "$db_url" ]]; then
    error "Failed to get database URL"
    exit 1
  fi

  # Get auth token
  local auth_token
  auth_token=$(turso db tokens create "$DB_NAME" 2>/dev/null | tr -d '[:space:]')

  if [[ -z "$auth_token" ]]; then
    error "Failed to create auth token"
    exit 1
  fi

  # Store credentials for later use
  cat > "$CREDENTIALS_FILE" <<EOF
DATABASE_URL=$db_url
TURSO_AUTH_TOKEN=$auth_token
EOF
  chmod 600 "$CREDENTIALS_FILE"

  success "Database URL: $db_url"
  success "Auth token: ${auth_token:0:10}...${auth_token: -5} (hidden for security)"
}

# ── Update Environment Files ──
update_env_files() {
  step "Updating environment files"

  source "$CREDENTIALS_FILE"

  # Update .env.production
  if [[ -f "$ENV_FILE" ]]; then
    info "Updating $ENV_FILE"
    # Replace existing values or add new ones
    if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
      sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
    else
      echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_FILE"
    fi

    if grep -q "^TURSO_AUTH_TOKEN=" "$ENV_FILE"; then
      sed -i.bak "s|^TURSO_AUTH_TOKEN=.*|TURSO_AUTH_TOKEN=\"$TURSO_AUTH_TOKEN\"|" "$ENV_FILE"
    else
      echo "TURSO_AUTH_TOKEN=\"$TURSO_AUTH_TOKEN\"" >> "$ENV_FILE"
    fi

    rm -f "${ENV_FILE}.bak"
  else
    info "Creating $ENV_FILE"
    cat > "$ENV_FILE" <<EOF
# Turso Database (cloud SQLite)
DATABASE_URL="$DATABASE_URL"
TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN"

# NextAuth Configuration (set these before deploying)
NEXTAUTH_SECRET="CHANGE_ME_generate_with_openssl_rand_base64_32"
NEXTAUTH_URL="https://sre-platform.vercel.app"
EOF
  fi

  # Update .env.local for local development with Turso
  if [[ -f "$ENV_LOCAL_FILE" ]]; then
    info "Updating $ENV_LOCAL_FILE"
    if grep -q "^DATABASE_URL=" "$ENV_LOCAL_FILE"; then
      sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_LOCAL_FILE"
    else
      echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_LOCAL_FILE"
    fi

    if grep -q "^TURSO_AUTH_TOKEN=" "$ENV_LOCAL_FILE"; then
      sed -i.bak "s|^TURSO_AUTH_TOKEN=.*|TURSO_AUTH_TOKEN=\"$TURSO_AUTH_TOKEN\"|" "$ENV_LOCAL_FILE"
    else
      echo "TURSO_AUTH_TOKEN=\"$TURSO_AUTH_TOKEN\"" >> "$ENV_LOCAL_FILE"
    fi

    rm -f "${ENV_LOCAL_FILE}.bak"
  else
    info "Creating $ENV_LOCAL_FILE"
    cat > "$ENV_LOCAL_FILE" <<EOF
# Local development — pointing to Turso cloud database
DATABASE_URL="$DATABASE_URL"
TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN"
NEXTAUTH_SECRET="dev-secret-not-for-production"
NEXTAUTH_URL="http://localhost:3000"
EOF
  fi

  success "Environment files updated"
}

# ── Run Prisma DB Push ──
prisma_push() {
  step "Pushing Prisma schema to Turso database"

  source "$CREDENTIALS_FILE"

  cd "$PROJECT_DIR"

  # Ensure Prisma client is generated
  info "Generating Prisma client..."
  if npx prisma generate 2>&1; then
    success "Prisma client generated"
  else
    error "Prisma generate failed"
    exit 1
  fi

  # Push schema to Turso
  info "Pushing schema to Turso database..."
  DATABASE_URL="$DATABASE_URL" TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" npx prisma db push 2>&1

  if [[ $? -eq 0 ]]; then
    success "Schema pushed to Turso database successfully"
  else
    error "Prisma db push failed"
    error "Check that your DATABASE_URL and TURSO_AUTH_TOKEN are correct"
    exit 1
  fi
}

# ── Output Summary ──
output_summary() {
  source "$CREDENTIALS_FILE"

  echo -e "\n${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${GREEN}   Turso Setup Complete! 🎉${NC}"
  echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}\n"

  echo -e "${BOLD}Database Name:${NC}     $DB_NAME"
  echo -e "${BOLD}Database URL:${NC}      $DATABASE_URL"
  echo -e "${BOLD}Auth Token:${NC}        ${TURSO_AUTH_TOKEN:0:10}...${TURSO_AUTH_TOKEN: -5}"
  echo -e ""
  echo -e "${BOLD}Environment files updated:${NC}"
  echo -e "  • $ENV_FILE"
  if [[ -f "$ENV_LOCAL_FILE" ]]; then
    echo -e "  • $ENV_LOCAL_FILE"
  fi

  echo -e ""
  echo -e "${YELLOW}${BOLD}⚠️  IMPORTANT: Set these environment variables in Vercel:${NC}"
  echo -e "  ${CYAN}DATABASE_URL${NC}=$DATABASE_URL"
  echo -e "  ${CYAN}TURSO_AUTH_TOKEN${NC}=${TURSO_AUTH_TOKEN:0:10}...${TURSO_AUTH_TOKEN: -5}"
  echo -e ""
  echo -e "${YELLOW}${BOLD}⚠️  Generate a NEXTAUTH_SECRET before deploying:${NC}"
  echo -e "  ${CYAN}openssl rand -base64 32${NC}"
  echo -e ""

  # Export for downstream scripts
  export TURSO_DATABASE_URL="$DATABASE_URL"
  export TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN"
}

# ── Main ──
main() {
  banner
  preflight
  install_turso_cli
  auth_turso
  create_database
  get_credentials
  update_env_files
  prisma_push
  output_summary
}

main "$@"
