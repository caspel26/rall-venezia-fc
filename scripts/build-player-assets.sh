#!/usr/bin/env bash
# Builds the website derivatives for every player from private-assets/players/<slug>/source.jpg:
#   portrait.webp  3:4 bust crop for squad cards   (native pixels, never upscaled)
#   hero.webp      full 3:4 frame for profile headers
#   thumb.webp     512x512 face crop for lists, stats and admin
# The face position per player is in scripts/player-faces.json. Identity is never altered: only crop,
# scale and format. Requires ImageMagick and jq.
set -euo pipefail
cd "$(dirname "$0")/.."
root=private-assets/players
faces=scripts/player-faces.json

clamp() { awk -v v="$1" -v lo="$2" -v hi="$3" 'BEGIN{ if (v<lo) v=lo; if (v>hi) v=hi; printf "%d", v }'; }

for dir in "$root"/*/; do
  slug=$(basename "$dir")
  src="$dir/source.jpg"
  [ -f "$src" ] || continue
  fx=$(jq -r ".\"$slug\".x // empty" "$faces"); fy=$(jq -r ".\"$slug\".y // empty" "$faces")
  [ -n "$fx" ] || { echo "no face position for $slug, skipping"; continue; }
  read -r w h < <(magick identify -format '%w %h\n' "$src")

  # portrait: 70% of the width, 3:4, face at ~30% of the crop height
  cw=$(awk -v w="$w" 'BEGIN{printf "%d", w*0.70}'); ch=$(awk -v c="$cw" 'BEGIN{printf "%d", c*4/3}')
  cx=$(clamp "$(awk -v w="$w" -v f="$fx" -v c="$cw" 'BEGIN{print w*f-c/2}')" 0 $((w-cw)))
  cy=$(clamp "$(awk -v h="$h" -v f="$fy" -v c="$ch" 'BEGIN{print h*f-c*0.30}')" 0 $((h-ch)))
  magick "$src" -crop "${cw}x${ch}+${cx}+${cy}" +repage -strip -quality 86 "$dir/portrait.webp"

  # thumbnail: 512px square around the face
  tx=$(clamp "$(awk -v w="$w" -v f="$fx" 'BEGIN{print w*f-256}')" 0 $((w-512)))
  ty=$(clamp "$(awk -v h="$h" -v f="$fy" 'BEGIN{print h*f-230}')" 0 $((h-512)))
  magick "$src" -crop "512x512+${tx}+${ty}" +repage -strip -quality 86 "$dir/thumb.webp"

  # hero: the whole frame
  magick "$src" -strip -quality 86 "$dir/hero.webp"
  echo "built $slug (${cw}x${ch} portrait @ ${cx},${cy})"
done
