#!/usr/bin/env bash
# Builds the website derivatives for every player and staff member from private-assets/{players,staff}/<slug>/cutout.png
# (made by scripts/cutout-players.py). All outputs are TRANSPARENT: the page paints the backdrop.
#   portrait.webp  bust, centred on the head, soft fade at the bottom   squad cards
#   half.webp      half body, centred on the head, soft fade             profile header
#   hero.webp      full body, trimmed                                      spare
#   thumb.webp     square, the head centred                               avatars, lists, admin
# Only crop, scale and format change; identity is never altered. Requires ImageMagick and jq.
set -euo pipefail
cd "$(dirname "$0")/.."
faces=scripts/player-faces.json
PAD=420 # transparent margin so crops can be centred on the head even near the edge

# crop WxH at X,Y of the padded cutout (coordinates in the unpadded image)
crop() { magick "$padded" -crop "$1x$2+$(( $3 + PAD ))+$(( $4 + PAD ))" +repage "$5"; }

# fade the bottom $2 percent of an image to transparent (a soft edge instead of a hard crop)
fade() {
  local f=$1 pct=$2 h
  h=$(magick identify -format '%h' "$f")
  magick -size 1x"$h" xc:white -fx "j < h*(1-$pct/100) ? 1 : max(0, 1 - (j - h*(1-$pct/100)) / (h*$pct/100))" mask.png
  magick "$f" \( mask.png -resize "$(magick identify -format '%w' "$f")x${h}!" \) -compose DstIn -composite -define webp:alpha-quality=100 -quality 88 "${f%.*}.webp" 2>/dev/null || true
  rm -f mask.png
}

for dir in private-assets/players/*/ private-assets/staff/*/; do
  [ -d "$dir" ] || continue
  slug=$(basename "$dir"); src="$dir/cutout.png"
  [ -f "$src" ] || { echo "no cutout for $slug (run scripts/cutout-players.py), skipping"; continue; }
  bust=$(jq -r ".\"$slug\".bust // 0.50" "$faces"); half=$(jq -r ".\"$slug\".half // 0.74" "$faces")
  padded=$(mktemp --suffix=.png); magick "$src" -background none -bordercolor none -border "$PAD" "$padded"

  bbox=$(magick "$src" -alpha extract -threshold 10% -format '%@' info:)
  bw=${bbox%%x*}; rest=${bbox#*x}; bh=${rest%%+*}; rest=${rest#*+}; bx=${rest%%+*}; by=${rest#*+}
  # the head: bounding box of the top 13% of the player; its centre is what we centre on
  hh=$(( bh * 13 / 100 ))
  hb=$(magick "$src" -crop "${bw}x${hh}+${bx}+${by}" +repage -alpha extract -threshold 10% -format '%@' info:)
  hw=${hb%%x*}; hrest=${hb#*x}; hx=${hrest#*+}; hx=${hx%%+*}
  hcx=$(( bx + hx + hw / 2 ))
  # explicit head position (fractions of the image, width in px) when something, e.g. a raised arm, fools the detection
  if [ "$(jq -r ".\"$slug\".head // empty" "$faces")" != "" ]; then
    iw=$(magick identify -format '%w' "$src"); ih=$(magick identify -format '%h' "$src")
    hcx=$(awk -v w="$iw" -v f="$(jq -r ".\"$slug\".head.cx" "$faces")" 'BEGIN{printf "%d", w*f}')
    hw=$(jq -r ".\"$slug\".head.w" "$faces")
    htop=$(awk -v h="$ih" -v f="$(jq -r ".\"$slug\".head.top" "$faces")" 'BEGIN{printf "%d", h*f}')
    by_head=$htop
  else
    by_head=$by
  fi

  # width that keeps the head in the middle and the whole body in frame, plus margin
  left=$(( hcx - bx )); right=$(( bx + bw - hcx )); half_w=$(( (left > right ? left : right) + 28 ))

  for variant in portrait:$bust half:$half; do
    name=${variant%%:*}; k=${variant##*:}
    ph=$(awk -v b="$bh" -v k="$k" 'BEGIN{printf "%d", b*k}'); pw=$(( half_w * 2 ))
    crop "$pw" "$ph" $(( hcx - half_w )) $(( by - 14 )) "$dir/$name.png"
    fade "$dir/$name.png" 28
    rm -f "$dir/$name.png"
  done

  # thumb: square around the head
  ts=$(( hw * 27 / 10 )); crop "$ts" "$ts" $(( hcx - ts / 2 )) $(( by_head - hw * 4 / 10 )) "$dir/thumb.png"
  magick "$dir/thumb.png" -define webp:alpha-quality=100 -quality 88 "$dir/thumb.webp"; rm -f "$dir/thumb.png"

  # hero: whole player
  magick "$src" -crop "$((bw+48))x$((bh+48))+$(( bx>24 ? bx-24 : 0 ))+$(( by>24 ? by-24 : 0 ))" +repage -define webp:alpha-quality=100 -quality 88 "$dir/hero.webp"
  rm -f "$padded"
  echo "built $slug (head centre x=$hcx, head ${hw}px, bust ${pw}x${ph})"
done
