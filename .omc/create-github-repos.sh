#!/bin/bash
#
# create-github-repos.sh
# Auto Company - Toplu GitHub Repo Oluşturma Script'i
#
# Kullanım:
#   1. GitHub auth ile giriş yap: gh auth login
#   2. Script'i çalıştır: ./create-github-repos.sh
#
# Özellikler:
#   - GitHub auth kontrolü
#   - 31+ ürün için repo oluşturma
#   - MIT License
#   - Otomatik git init ve push
#   - Renkli çıktı ve özet rapor
#

set -euo pipefail

# 
# RENKLER VE SABİTLER
# 

readonly GREEN'\033[0;32m'
readonly RED'\033[0;31m'
readonly YELLOW'\033[1;33m'
readonly BLUE'\033[0;34m'
readonly CYAN'\033[0;36m'
readonly GRAY'\033[0;90m'
readonly BOLD'\033[1m'
readonly NC'\033[0m' # No Color

readonly PROJECT_DIR"/home/tolgabrk/projects/Auto-Company"
readonly PRODUCTS_DIR"${PROJECT_DIR}/projects"
readonly LOG_FILE"${PROJECT_DIR}/.omc/repo-creation-$(date +%Y%m%d-%H%M%S).log"

# Başarı sayacı
SUCCESS_COUNT0
SKIP_COUNT0
FAIL_COUNT0

# 
# YARDIMCI FONKSİYONLAR
# 

log() {
    echo -e "${GRAY}[$(date '+%H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $*" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $*" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${CYAN}ℹ${NC} $*" | tee -a "$LOG_FILE"
}

header() {
    echo -e "\n${BOLD}${BLUE}$1${NC}" | tee -a "$LOG_FILE"
}

# 
# GITHUB AUTH KONTROLÜ
# 

check_github_auth() {
    header "GitHub Auth Kontrolü"

    if ! gh auth status &>/dev/null; then
        error "GitHub'a giriş yapılmamış!"
        echo ""
        info "Aşağıdaki komutu çalıştırarak giriş yap:"
        echo -e "    ${CYAN}gh auth login${NC}"
        echo ""
        info "Web browser ile seçenekleri:"
        echo "  1. GitHub.com"
        echo "  2. HTTPS"
        echo "  3. Yes (Upload SSH key)"
        echo ""
        exit 1
    fi

    local gh_user
    gh_user$(gh auth status --hostname github.com 2>/dev/null | grep "Logged in as" | sed 's/.*Logged in as //;s/\.//')

    success "GitHub auth aktif: ${BOLD}${gh_user}${NC}"
    echo ""
}

# 
# ÜRÜN LİSTESİ
# 

get_products() {
    # Gerçek ürün dizinlerini al (docs, landing-pages hariç)
    ls -1 "$PRODUCTS_DIR" 2>/dev/null | \
        grep -v -E '\.(zip|tgz|md)$' | \
        grep -v -E '^(docs|landing-pages|product7-landing-pages|pt-booking-landing)$' | \
        grep -v -E '(README-tmp|autotask-extension)' | \
        sort
}

# 
# ÜRÜN BİLGİLERİ
# 

get_product_description() {
    local product$1
    local desc_file"${PRODUCTS_DIR}/${product}/package.json"

    if [[ -f "$desc_file" ]]; then
        # package.json'dan description al
        if command -v jq &>/dev/null; then
            jq -r '.description // empty' "$desc_file" 2>/dev/null | head -1
        else
            grep -A1 '"description"' "$desc_file" 2>/dev/null | grep '"' | sed 's/.*"\([^"]*\)".*/\1/' | head -1
        fi
    else
        # Varsayılan açıklama
        echo "CLI tool for ${product}"
    fi
}

get_product_topics() {
    local product$1
    local pkg_file"${PRODUCTS_DIR}/${product}/package.json"

    # Temel topics
    local topics("cli" "tool" "automation" "developer-tools")

    # package.json keywords varsa ekle
    if [[ -f "$pkg_file" ]] && command -v jq &>/dev/null; then
        local keywords
        keywords$(jq -r '.keywords // empty | join(",")' "$pkg_file" 2>/dev/null)
        if [[ -n "$keywords" ]]; then
            IFS',' read -ra KW <<< "$keywords"
            for kw in "${KW[@]}"; do
                topics+("$kw")
            done
        fi
    fi

    # İlk 5 topic
    printf '%s\n' "${topics[@]}" | head -5 | tr '\n' ',' | sed 's/,$//'
}

# 
# REPO OLUŞTURMA
# 

create_repo_for_product() {
    local product$1
    local product_dir"${PRODUCTS_DIR}/${product}"
    local repo_name"auto-${product}"
    local repo_url""

    header "Ürün: ${BOLD}${product}${NC}"

    # Dizin kontrolü
    if [[ ! -d "$product_dir" ]]; then
        warn "Dizin bulunamadı, atlanıyor: ${product_dir}"
        ((SKIP_COUNT++))
        return 1
    fi

    # Git init kontrolü
    cd "$product_dir"
    if [[ ! -d ".git" ]]; then
        info "Git repo başlatılıyor..."
        git init -q 2>/dev/null || {
            error "Git init başarısız"
            ((FAIL_COUNT++))
            return 1
        }
    fi

    # Açıklama ve topics
    local description
    local topics
    description$(get_product_description "$product")
    topics$(get_product_topics "$product")

    info "Açıklama: ${description}"
    info "Topics: ${topics}"

    # Repo zaten var mı kontrol et
    if gh repo view "$repo_name" &>/dev/null; then
        warn "Repo zaten var: ${repo_name}"
        repo_url$(gh repo view "$repo_name" --json url -q '.url')
        ((SKIP_COUNT++))
        return 0
    fi

    # Repo oluştur
    info "GitHub repo oluşturuluyor: ${repo_name}"

    if gh repo create "$repo_name" \
        --public \
        --description "$description" \
        --source "$product_dir" \
        --add-readmefalse \
        2>&1 | tee -a "$LOG_FILE"; then

        success "Repo oluşturuldu: ${repo_name}"

        # Topics ekle
        if [[ -n "$topics" ]]; then
            info "Topics ekleniyor: ${topics}"
            IFS',' read -ra TOPIC_ARRAY <<< "$topics"
            gh repo edit "$repo_name" --add-topic "${TOPIC_ARRAY[@]}" &>/dev/null || true
        fi

        # Remote ekle
        git remote add origin "git@github.com:tolgabrk/${repo_name}.git" 2>/dev/null || \
        git remote set-url origin "git@github.com:tolgabrk/${repo_name}.git" 2>/dev/null

        # MIT License oluştur
        if [[ ! -f "LICENSE" ]]; then
            info "MIT License oluşturuluyor..."
            cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 Auto Company

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
            git add LICENSE 2>/dev/null || true
        fi

        # Initial commit (boşsa)
        if git rev-parse --git-dir >/dev/null 2>&1 && ! git rev-parse HEAD >/dev/null 2>&1; then
            # Hiç commit yoksa
            if [[ -n "$(git ls-files)" ]]; then
                git add -A
                git commit -q -m "Initial commit" 2>/dev/null || true
            fi
        fi

        # Push
        info "Push yapılıyor..."
        if git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null; then
            success "Push başarılı"
        else
            warn "Push başarısız (manuel push gerekebilir)"
        fi

        repo_url"https://github.com/tolgabrk/${repo_name}"
        ((SUCCESS_COUNT++))
    else
        error "Repo oluşturma başarısız: ${repo_name}"
        ((FAIL_COUNT++))
        return 1
    fi

    echo ""

    # Repo URL'ini yaz
    echo "$repo_url" >> "${PROJECT_DIR}/.omc/created-repos.txt"
}

# 
# ANA PROGRAM
# 

main() {
    # Log dosyası oluştur
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "Repo Creation Log - $(date)" > "$LOG_FILE"

    header "═══════════════════════════════════════════════════════════════"
    header "   Auto Company - GitHub Repo Oluşturma Script'i"
    header "═══════════════════════════════════════════════════════════════"

    # Auth kontrol
    check_github_auth

    # Ürünleri listele
    local products
    mapfile -t products < <(get_products)

    local product_count${#products[@]}
    header "Bulunan Ürün Sayısı: ${BOLD}${product_count}${NC}"
    echo ""

    # Her ürün için repo oluştur
    for product in "${products[@]}"; do
        create_repo_for_product "$product"
    done

    # Özet rapor
    header "═══════════════════════════════════════════════════════════════"
    header "   ÖZET RAPOR"
    header "═══════════════════════════════════════════════════════════════"

    echo ""
    echo -e "  ${GREEN}Başarılı:${NC}     ${BOLD}${SUCCESS_COUNT}${NC}"
    echo -e "  ${YELLOW}Atlanan:${NC}      ${BOLD}${SKIP_COUNT}${NC}"
    echo -e "  ${RED}Başarısız:${NC}    ${BOLD}${FAIL_COUNT}${NC}"
    echo -e "  ${CYAN}Toplam:${NC}       ${BOLD}${product_count}${NC}"
    echo ""

    # Oluşturulan repolar
    if [[ -f "${PROJECT_DIR}/.omc/created-repos.txt" ]]; then
        info "Oluşturulan Repo URL'leri:"
        echo ""
        while read -r url; do
            [[ -n "$url" ]] && echo -e "  • ${CYAN}${url}${NC}"
        done < "${PROJECT_DIR}/.omc/created-repos.txt"
        echo ""
        info "Tam liste: ${PROJECT_DIR}/.omc/created-repos.txt"
    fi

    echo ""
    info "Log dosyası: ${LOG_FILE}"
    echo ""
}

# 
# ÇALIŞTIR
# 

main "$@"
