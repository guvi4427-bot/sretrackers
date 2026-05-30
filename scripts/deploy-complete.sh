#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  S/R/E Platform — Complete Deployment Script
#  Master script: Turso setup → Vercel deploy → DB seed → Verify
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Color Palette ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# ── Constants ──
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

# ── Helper Functions ──
info()    { echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"; }
step()    { echo -e "\n${CYAN}${BOLD}──▶ $1 ──${NC}" | tee -a "$LOG_FILE"; }

banner() {
  echo -e "\n${BOLD}${MAGENTA}═══════════════════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
  echo -e "${BOLD}${MAGENTA}   S/R/E Platform — Complete Production Deployment${NC}" | tee -a "$LOG_FILE"
  echo -e "${BOLD}${MAGENTA}   Start / Restart / Explore${NC}" | tee -a "$LOG_FILE"
  echo -e "${BOLD}${MAGENTA}═══════════════════════════════════════════════════════${NC}\n" | tee -a "$LOG_FILE"
}

# ── Track overall status ──
STEPS_TOTAL=4
STEPS_COMPLETED=0
CURRENT_STEP=0

increment_step() {
  ((CURRENT_STEP++)) || true
  echo -e "\n${BOLD}[Step $CURRENT_STEP/$STEPS_TOTAL] $1${NC}" | tee -a "$LOG_FILE"
}

mark_complete() {
  ((STEPS_COMPLETED++)) || true
  success "Step $CURRENT_STEP complete ($STEPS_COMPLETED/$STEPS_TOTAL done)"
}

# ── Phase 1: Turso Setup ──
phase_turso() {
  increment_step "Turso Database Setup"
  info "Running scripts/setup-turso.sh..."

  if [[ -x "$SCRIPT_DIR/setup-turso.sh" ]]; then
    bash "$SCRIPT_DIR/setup-turso.sh" 2>&1 | tee -a "$LOG_FILE"
    if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
      mark_complete
    else
      error "Turso setup failed. Check the log: $LOG_FILE"
      error "You can re-run this step with: bash scripts/setup-turso.sh"
      return 1
    fi
  else
    error "scripts/setup-turso.sh not found or not executable"
    return 1
  fi
}

# ── Phase 2: Vercel Deploy ──
phase_vercel() {
  increment_step "Vercel Deployment"
  info "Running scripts/deploy-vercel.sh..."

  if [[ -x "$SCRIPT_DIR/deploy-vercel.sh" ]]; then
    bash "$SCRIPT_DIR/deploy-vercel.sh" 2>&1 | tee -a "$LOG_FILE"
    if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
      mark_complete
    else
      error "Vercel deployment failed. Check the log: $LOG_FILE"
      error "You can re-run this step with: bash scripts/deploy-vercel.sh"
      return 1
    fi
  else
    error "scripts/deploy-vercel.sh not found or not executable"
    return 1
  fi
}

# ── Phase 3: Seed Production DB ──
phase_seed() {
  increment_step "Seeding Production Database"
  info "Running scripts/seed-production.sh..."

  if [[ -x "$SCRIPT_DIR/seed-production.sh" ]]; then
    bash "$SCRIPT_DIR/seed-production.sh" 2>&1 | tee -a "$LOG_FILE"
    if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
      mark_complete
    else
      warn "Database seeding had issues (may be already seeded)"
      warn "You can re-run: bash scripts/seed-production.sh"
      # Don't fail the whole deployment for seeding issues
      mark_complete
    fi
  else
    warn "scripts/seed-production.sh not found. Skipping seed step."
    warn "Run it manually after deployment."
  fi
}

# ── Phase 4: Post-deployment Verification ──
phase_verify() {
  increment_step "Post-deployment Verification"

  local deploy_url=""
  if [[ -f "$PROJECT_DIR/.last-deploy-url" ]]; then
    deploy_url=$(cat "$PROJECT_DIR/.last-deploy-url")
  fi

  if [[ -z "$deploy_url" ]]; then
    warn "No deployment URL found. Manual verification required."
    warn "Visit your Vercel dashboard to find the deployment URL."
    mark_complete
    return 0
  fi

  info "Verifying deployment at: $deploy_url"

  # Health check
  info "Checking /api/health endpoint..."
  local health_status
  health_status=$(curl -s -o /dev/null -w "%{http_code}" "$deploy_url/api/health" 2>/dev/null || echo "000")

  if [[ "$health_status" == "200" ]]; then
    success "Health check passed (HTTP 200)"
  elif [[ "$health_status" == "000" ]]; then
    warn "Could not reach $deploy_url (network issue or DNS not yet propagated)"
    warn "Try again in a minute: curl $deploy_url/api/health"
  else
    warn "Health check returned HTTP $health_status (may need a moment to start up)"
    warn "Try again in a minute: curl $deploy_url/api/health"
  fi

  # Homepage check
  info "Checking homepage..."
  local home_status
  home_status=$(curl -s -o /dev/null -w "%{http_code}" "$deploy_url" 2>/dev/null || echo "000")

  if [[ "$home_status" == "200" || "$home_status" == "301" || "$home_status" == "302" ]]; then
    success "Homepage accessible (HTTP $home_status)"
  else
    warn "Homepage returned HTTP $home_status"
  fi

  mark_complete
}

# ── Final Summary ──
final_summary() {
  local deploy_url=""
  if [[ -f "$PROJECT_DIR/.last-deploy-url" ]]; then
    deploy_url=$(cat "$PROJECT_DIR/.last-deploy-url")
  fi

  echo -e "\n${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
  echo -e "${BOLD}${GREEN}   Deployment Complete! 🎉🚀${NC}" | tee -a "$LOG_FILE"
  echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}\n" | tee -a "$LOG_FILE"

  echo -e "${BOLD}Steps completed:${NC}     $STEPS_COMPLETED/$STEPS_TOTAL"
  echo -e "${BOLD}Log file:${NC}           $LOG_FILE"

  if [[ -n "$deploy_url" ]]; then
    echo -e "${BOLD}Production URL:${NC}     $deploy_url"
  fi

  echo -e ""
  echo -e "${BOLD}${CYAN}Quick Links:${NC}"
  if [[ -n "$deploy_url" ]]; then
    echo -e "  • App:            $deploy_url"
    echo -e "  • Health:         $deploy_url/api/health"
    echo -e "  • Admin Login:    $deploy_url/login"
  fi
  echo -e "  • Vercel:         https://vercel.com/dashboard"
  echo -e "  • Turso:          https://turso.tech/app"
  echo -e ""

  if [[ $STEPS_COMPLETED -lt $STEPS_TOTAL ]]; then
    echo -e "${YELLOW}${BOLD}⚠️  Some steps did not complete successfully.${NC}"
    echo -e "${YELLOW}   Re-run individual steps as needed:${NC}"
    echo -e "  ${CYAN}bash scripts/setup-turso.sh${NC}"
    echo -e "  ${CYAN}bash scripts/deploy-vercel.sh${NC}"
    echo -e "  ${CYAN}bash scripts/seed-production.sh${NC}"
    echo -e ""
  fi

  echo -e "${YELLOW}${BOLD}⚠️  Post-deployment checklist:${NC}"
  echo -e "  1. Change the default admin password after first login"
  echo -e "  2. Set up a custom domain in Vercel (optional)"
  echo -e "  3. Configure email/SMS providers if using OTP auth"
  echo -e "  4. Review Vercel analytics and logs"
  echo -e "  5. Set up monitoring/alerts (optional)"
  echo -e "  6. Configure GitHub Actions for CI/CD (see DEPLOY.md)"
}

# ── Main ──
main() {
  banner

  # Create log file
  touch "$LOG_FILE"
  info "Logging to: $LOG_FILE"
  info "Started at: $(date)"

  # Run phases sequentially, with option to skip
  local skip_turso=false
  local skip_vercel=false
  local skip_seed=false
  local skip_verify=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --skip-turso)  skip_turso=true; shift ;;
      --skip-vercel) skip_vercel=true; shift ;;
      --skip-seed)   skip_seed=true; shift ;;
      --skip-verify) skip_verify=true; shift ;;
      --turso-only)  skip_vercel=true; skip_seed=true; skip_verify=true; shift ;;
      --vercel-only) skip_turso=true; skip_seed=true; skip_verify=true; shift ;;
      --seed-only)   skip_turso=true; skip_vercel=true; skip_verify=true; shift ;;
      --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --skip-turso      Skip Turso database setup"
        echo "  --skip-vercel     Skip Vercel deployment"
        echo "  --skip-seed       Skip database seeding"
        echo "  --skip-verify     Skip post-deployment verification"
        echo "  --turso-only      Only run Turso setup"
        echo "  --vercel-only     Only run Vercel deployment"
        echo "  --seed-only       Only run database seeding"
        echo "  --help            Show this help message"
        echo ""
        echo "Example:"
        echo "  $0                    # Full deployment"
        echo "  $0 --skip-turso       # Skip Turso (if already set up)"
        echo "  $0 --seed-only        # Only seed the database"
        exit 0
        ;;
      *) error "Unknown option: $1"; exit 1 ;;
    esac
  done

  # Adjust total steps based on what we're running
  STEPS_TOTAL=0
  [[ "$skip_turso" == false ]] && ((STEPS_TOTAL++)) || true
  [[ "$skip_vercel" == false ]] && ((STEPS_TOTAL++)) || true
  [[ "$skip_seed" == false ]] && ((STEPS_TOTAL++)) || true
  [[ "$skip_verify" == false ]] && ((STEPS_TOTAL++)) || true

  # Execute phases
  local failed=false

  if [[ "$skip_turso" == false ]]; then
    phase_turso || failed=true
  else
    info "Skipping Turso setup (--skip-turso)"
  fi

  if [[ "$skip_vercel" == false ]]; then
    phase_vercel || failed=true
  else
    info "Skipping Vercel deployment (--skip-vercel)"
  fi

  if [[ "$skip_seed" == false ]]; then
    phase_seed || true  # Seed failure is non-fatal
  else
    info "Skipping database seeding (--skip-seed)"
  fi

  if [[ "$skip_verify" == false ]]; then
    phase_verify || true  # Verify failure is non-fatal
  else
    info "Skipping post-deployment verification (--skip-verify)"
  fi

  final_summary

  if [[ "$failed" == true ]]; then
    exit 1
  fi
}

main "$@"
