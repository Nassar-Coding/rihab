"""Build the place/brand visuals from assets/places/manifest.json.

    python3 scripts/place-assets-build.py --src <folder of supplied files>   # normalise + emit
    python3 scripts/place-assets-build.py                                    # emit from assets/places/*.webp

Normalising (with --src): each supplied file named <stem>.<ext> becomes
assets/places/<stem>.webp.
  photo: EXIF-rotated, long edge capped at 820 px (never upscaled), WebP q56.
  logo:  empty margins trimmed (transparent, or a uniform background colour), long edge
         capped at 600 px (never upscaled), transparency kept, WebP q90. The surface the
         logo sits on is the image's own background colour when it has one; a light or
         dark neutral for a transparent mark, so a white mark never lands on white.
Width, height, surface and a low-resolution flag go back into the manifest, and
assets/place-data.js is regenerated for scripts/place-sync.mjs to inline as PLACE_ASSETS.
"""
import base64, json, os, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, "assets", "places")
MANIFEST = os.path.join(DIR, "manifest.json")
LIGHT, DARK = "#FBF9F4", "#1F2321"
LOW_RES = 640          # photos narrower than this get the restrained hero treatment

def border_colour(im):
    rgb = im.convert("RGB"); w, h = rgb.size
    px = [rgb.getpixel((x, y)) for x in range(0, w, max(1, w // 40)) for y in (0, h - 1)]
    px += [rgb.getpixel((x, y)) for y in range(0, h, max(1, h // 40)) for x in (0, w - 1)]
    px.sort(key=sum); r, g, b = px[len(px) // 2]
    spread = max(max(abs(c - m) for c, m in zip(p, (r, g, b))) for p in px)
    return (r, g, b), spread

def trim(im):
    """Trim empty margins only: transparent pixels, or a uniform background colour."""
    if im.mode == "RGBA":
        box = im.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
        if box: im = im.crop(box)
        return im, None
    (r, g, b), spread = border_colour(im)
    if spread > 40:                      # textured or busy edge: keep the frame as is
        return im, (r, g, b)
    rgb = im.convert("RGB")
    mask = Image.new("L", rgb.size, 0)
    mask.putdata([255 if max(abs(p[0] - r), abs(p[1] - g), abs(p[2] - b)) > 28 else 0 for p in rgb.getdata()])
    box = mask.getbbox()
    if box: im = im.crop(box)
    return im, (r, g, b)

def logo_surface(im, bg):
    if bg is not None:
        return "#%02X%02X%02X" % bg
    rgba = im.convert("RGBA"); small = rgba.resize((64, max(1, int(64 * rgba.height / rgba.width))))
    lum = [0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in small.getdata() if p[3] > 128]
    return DARK if lum and sum(lum) / len(lum) > 185 else LIGHT

def normalise(src, stem, entry):
    im = Image.open(src); im.load()
    im = ImageOps.exif_transpose(im)
    im = im.convert("RGBA") if (im.mode in ("RGBA", "LA", "P") and (im.mode != "P" or "transparency" in im.info)) else im.convert("RGB")
    if im.mode == "RGBA" and min(im.getchannel("A").getextrema()) >= 250:
        im = im.convert("RGB")
    out = os.path.join(DIR, stem + ".webp")
    if entry["kind"] == "logo":
        im, bg = trim(im)
        im.thumbnail((600, 600), Image.LANCZOS)
        pad = 0.06
        if bg is not None:                # keep a little of its own background around the mark
            pw, ph = int(im.width * pad), int(im.height * pad)
            canvas = Image.new("RGB", (im.width + 2 * pw, im.height + 2 * ph), bg)
            canvas.paste(im.convert("RGB"), (pw, ph)); im = canvas
        entry["bg"] = logo_surface(im, bg)
        im.save(out, "WEBP", quality=90, method=6)
    else:
        im = im.convert("RGB")
        im.thumbnail((820, 820), Image.LANCZOS)
        entry["lo"] = im.width < LOW_RES
        entry.pop("bg", None)
        im.save(out, "WEBP", quality=56, method=6)
    entry["w"], entry["h"] = im.size

def main():
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    src_dir = sys.argv[sys.argv.index("--src") + 1] if "--src" in sys.argv else None
    if src_dir:
        files = {os.path.splitext(f)[0]: os.path.join(src_dir, f) for f in os.listdir(src_dir)}
        for stem, entry in manifest.items():
            if stem.startswith("_"): continue
            if stem not in files: raise SystemExit(f"missing supplied file for {stem}")
            normalise(files[stem], stem, entry)
        json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    lines = ["const PLACE_ASSETS = {"]
    total = 0
    for stem, e in manifest.items():
        if stem.startswith("_"): continue
        path = os.path.join(DIR, stem + ".webp")
        data = open(path, "rb").read(); total += len(data)
        meta = {"kind": e["kind"], "w": e["w"], "h": e["h"], "ids": e["ids"]}
        if e["kind"] == "logo": meta["bg"] = e["bg"]
        if e.get("lo"): meta["lo"] = True
        meta_js = json.dumps(meta, ensure_ascii=False)[:-1]
        lines.append(f'  {stem}: {meta_js}, src: "data:image/webp;base64,{base64.b64encode(data).decode()}" }},')
    lines.append("};")
    open(os.path.join(ROOT, "assets", "place-data.js"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print(f"PLACE_ASSETS: {len(lines) - 2} assets, {total // 1024} KB of WebP")

main()
