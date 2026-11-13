"""Run after cutout-players.py for raffaele-miranda: removes what the matting cannot separate from the player
(the blue jeans and the banner of a bystander behind the raised hand,)."""
import numpy as np
from PIL import Image

p = 'private-assets/players/raffaele-miranda/cutout.png'
a = np.array(Image.open(p).convert('RGBA'))
r, g, b = [a[..., i].astype(int) for i in range(3)]
blue = (b > r + 12) & (b > g - 5)
reg = np.zeros(blue.shape, bool)
reg[500:700, :395] = True
a[..., 3] = np.where(blue & reg, 0, a[..., 3])
a[513:553, 380:404, 3] = 0   # grey sliver left of the thumb, above the fist
green = (g > r + 8) & (g >= b - 10) & (r < 140)  # court showing between the thumb and the sleeve
reg2 = np.zeros(green.shape, bool)
reg2[505:580, 405:452] = True
a[..., 3] = np.where(green & reg2, 0, a[..., 3])
dark = (r + g + b) < 360
reg3 = np.zeros(dark.shape, bool)
reg3[512:580, 428:452] = True
a[..., 3] = np.where(dark & reg3, 0, a[..., 3])
a[548:562, 380:400, 3] = 0
Image.fromarray(a).save(p)
