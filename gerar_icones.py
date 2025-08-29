from PIL import Image
import os

# Caminho do ícone original
src = os.path.join('icons', 'icon-512x512.png')
# Tamanhos necessários
sizes = [
    (72, 'icon-72x72.png'),
    (96, 'icon-96x96.png'),
    (128, 'icon-128x128.png'),
    (144, 'icon-144x144.png'),
    (152, 'icon-152x152.png'),
    (192, 'icon-192x192.png'),
    (384, 'icon-384x384.png'),
]

img = Image.open(src)
for size, filename in sizes:
    img_resized = img.resize((size, size), Image.LANCZOS)
    img_resized.save(os.path.join('icons', filename), format='PNG')
print('Ícones gerados com sucesso!')
