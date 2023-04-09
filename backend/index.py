import torch
import clip
from PIL import Image
from pathlib import Path
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"
MODEL, preprocess = clip.load("ViT-L/14", device=device)
MODEL.eval()
MODEL.to('cuda')
dtype = next(MODEL.parameters()).dtype

def init_sql():
    lines = ["CREATE TABLE items (id bigserial PRIMARY KEY, embedding vector(768), sku_name VARCHAR(255) default '');\n"]
    with torch.no_grad(), torch.autocast("cuda"):
        for filename in Path('./imgs').glob('*.png'):
            image = preprocess(Image.open(filename)).unsqueeze(0).to(device)
            image_features = MODEL.encode_image(image)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            v = ", ".join( map(lambda x: str(x) , image_features.tolist()[0])  )
            sql = "INSERT INTO items (embedding, sku_name) VALUES ('[%s]', '%s');\n" % (v, filename)
            lines.append(sql)
    with open("init.sql", "w") as f:
        f.writelines(lines)

def img_to_vector(pil_image):
    with torch.no_grad(), torch.autocast("cuda"):
        image = preprocess(pil_image).unsqueeze(0).to(device)
        image_features = MODEL.encode_image(image)
        image_features /= image_features.norm(dim=-1, keepdim=True)
        return image_features

if __name__ == "__main__":
    init_sql()
