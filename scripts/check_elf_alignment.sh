#!/usr/bin/env bash
#
# 16KB page size compliance check (Google Play requirement for apps
# targeting Android 15+ devices with 16KB pages).
#
# Verifies that every 64-bit native library (.so) inside an APK has all of
# its ELF LOAD segments aligned to at least 16384 (2**14) bytes. Run against
# any built APK:
#
#   ./gradlew :app:assembleGmsRelease
#   scripts/check_elf_alignment.sh android/app/build/outputs/apk/gms/release/app-gms-release.apk
#
# Exits non-zero and lists offenders if any library is misaligned, so a
# future dependency that ships 4KB-aligned libs fails CI instead of failing
# Play review.
set -euo pipefail

APK="${1:?usage: $0 <path-to-apk>}"
MIN_ALIGN=16384

if ! command -v readelf >/dev/null 2>&1; then
  echo "error: readelf not found (install binutils)" >&2
  exit 2
fi

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

unzip -q "$APK" 'lib/*' -d "$WORKDIR" 2>/dev/null || {
  echo "No native libraries in $APK — nothing to check."
  exit 0
}

# 16KB pages only exist on 64-bit; 32-bit ABIs are exempt.
mapfile -t LIBS < <(find "$WORKDIR/lib/arm64-v8a" "$WORKDIR/lib/x86_64" -name '*.so' 2>/dev/null || true)

if [ "${#LIBS[@]}" -eq 0 ]; then
  echo "No 64-bit native libraries in $APK — nothing to check."
  exit 0
fi

FAILED=0
for lib in "${LIBS[@]}"; do
  rel="${lib#"$WORKDIR"/}"
  # LOAD segment lines: the alignment is the last field (e.g. 0x4000).
  bad_aligns="$(readelf -lW "$lib" | awk '$1 == "LOAD" { print $NF }' | sort -u | while read -r align; do
    if [ $((align)) -lt "$MIN_ALIGN" ]; then
      echo "$align"
    fi
  done)"
  if [ -n "$bad_aligns" ]; then
    echo "FAIL  $rel (LOAD align: $(echo "$bad_aligns" | tr '\n' ' '))"
    FAILED=1
  else
    echo "ok    $rel"
  fi
done

if [ "$FAILED" -ne 0 ]; then
  echo ""
  echo "❌ 16KB alignment check FAILED — the libraries above were linked"
  echo "   with 4KB page alignment. Find the owning dependency and update it,"
  echo "   or rebuild it with NDK r28+ / -Wl,-z,max-page-size=16384."
  exit 1
fi

echo ""
echo "✅ All 64-bit native libraries are 16KB-aligned."
