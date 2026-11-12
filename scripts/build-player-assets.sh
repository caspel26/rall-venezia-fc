#!/usr/bin/env bash
# Builds the website derivatives for every player from private-assets/players/<slug>/cutout.png
# (made by scripts/cutout-players.py). All outputs are TRANSPARENT: the page paints the branded background.
#   portrait.webp  bust, 3:4      squad cards
#   hero.webp      full body      profile header, home hero
#   thumb.webp     head+shoulders lists, admin
# Only crop, scale and format change; identity is never altered. Requires ImageMagick and jq.
set -euo pipefail
cd "$(dirname "$0")/.."
faces=scripts/player-faces.json

clamp() { awk -v v="$1" -v lo="$2" -v hi="$3" 'BEGIN{ if (v<lo) v=lo; if (v>hi) v=hi; printf "%d", v }'; }

for dir in private-assets/players/*/ private-assets/staff/*/; do
  [ -d "$dir" ] || continue
  slug=$(basename "$dir")
  src="$dir/cutout.png"
  [ -f "$src" ] || { echo "no cutout for $slug (run scripts/cutout-players.py), skipping"; continue; }
  fx=$(jq -r ".\"$slug\".x" "$faces")
  bust=$(jq -r ".\"$slug\".bust // 0.52" "$faces")
  read -r w h < <(magick identify -format '%w %h\n' "$src")
  # alpha bounding box of the player: WxH+X+Y
  bbox=$(magick "$src" -alpha extract -threshold 10% -format '%@' info:)
  bw=${bbox%%x*}; rest=${bbox#*x}; bh=${rest%%+*}; rest=${rest#*+}; bx=${rest%%+*}; by=${rest#*+}

  # hero: the whole player with a small margin
  pad=24
  hx=$(clamp $((bx-pad)) 0 $w); hy=$(clamp $((by-pad)) 0 $h)
  magick "$src" -crop "$((bw+2*pad))x$((bh+2*pad))+${hx}+${hy}" +repage -strip -define webp:alpha-quality=100 -quality 88 "$dir/hero.webp"

  # portrait: bust = top 52% of the player's height, 3:4, centred on the face
  ph=$(awk -v b="$bh" -v k="$bust" 'BEGIN{printf "%d", b*k}'); pw=$(awk -v p="$ph" 'BEGIN{printf "%d", p*0.75}')
  px=$(clamp "$(awk -v w="$w" -v f="$fx" -v c="$pw" 'BEGIN{print w*f-c/2}')" 0 $((w-pw)))
  py=$(clamp $((by-12)) 0 $((h-ph)))
  magick "$src" -crop "${pw}x${ph}+${px}+${py}" +repage -strip -define webp:alpha-quality=100 -quality 88 "$dir/portrait.webp"

  # thumb: head and shoulders, square
  ts=$(awk -v b="$bh" 'BEGIN{printf "%d", b*0.30}')
  tx=$(clamp "$(awk -v w="$w" -v f="$fx" -v c="$ts" 'BEGIN{print w*f-c/2}')" 0 $((w-ts)))
  ty=$(clamp $((by-8)) 0 $((h-ts)))
  magick "$src" -crop "${ts}x${ts}+${tx}+${ty}" +repage -strip -define webp:alpha-quality=100 -quality 88 "$dir/thumb.webp"
  echo "built $slug (player ${bw}x${bh}, portrait ${pw}x${ph}, thumb ${ts}px)"
done
