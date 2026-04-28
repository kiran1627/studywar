# PWA Icons Setup

## Quick Setup

Copy your SW logo image to this directory with all these filenames:

```
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
```

### PowerShell command (run from this directory):

```powershell
# Place your logo as "logo.png" in this folder, then run:
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
foreach ($size in $sizes) {
    Copy-Item "logo.png" "icon-${size}x${size}.png"
}
```

The browser will automatically resize the icon to fit each context.
For pixel-perfect results, use an image editor to resize to each dimension.
