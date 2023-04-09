from typing import Any, Optional
from index import img_to_vector
from fastapi import FastAPI, File, UploadFile, Form, APIRouter
from pydantic import BaseModel
from PIL import Image
import traceback
import os
from db import similar_query
from api import pix2pix, img2text, sam, chatgpt
import io
import uuid
from segment_anything import SamPredictor, sam_model_registry
from typing import List
from fastapi.middleware.cors import CORSMiddleware
origins = [
    'http://localhost:3000',
]


os.environ["REPLICATE_API_TOKEN"] = "bfbf76afce887aa51a97f2140b75970bfe575729"
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)
# router = APIRouter(
#     # prefix="/api",
# )
# app.include_router(router)

def operate_image(image, w=512, h=512):
    img = Image.open(io.BytesIO(image.file.read()))
    if img.width > w or img.height > h:
        img.thumbnail((w, h))
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        image = buffer
    else:
        image = image.file.read()
    return image

def error(msg):
    return {'status': 1, 'msg': msg}

def success(data):
    return {'status': 0, 'msg': 'Success', 'data': data}

@app.get("/api/")
async def hello():
    return {
        "hello": "hello"
    }

@app.post("/api/upload/")
async def upload_image(image: UploadFile = File(...)):
    try:
        with Image.open(image.file) as img:
            filename = f"{uuid.uuid4()}.png"
            save_path = f"/var/www/html/imgs/{filename}"
            img.save(save_path)
            return {"url": filename}
    except:
        return {"error": traceback.format_exc()}

@app.post("/api/image/")
async def process_image(image: UploadFile = File(...)):
    try:
        with Image.open(image.file) as img:
            # width, height = img.size
            # return {"width": width, "height": height}
            vector = img_to_vector(img)
            recommend_list = similar_query(vector)
            return success(recommend_list)
    except:
        return error(traceback.format_exc())

@app.post("/api/pix2pix/")
async def run_pix2pix(image: UploadFile = File(...), prompt: str = Form(None), negative_prompt: str = Form(None), num_outputs: int = Form(1), num_inference_steps: int = Form(100), guidance_scale: float = Form(7.5), image_guidance_scale: float = Form(1.5), scheduler: str = Form("K_EULER_ANCESTRAL"), seed: int = Form(None)):
    try:
        # return success(prompt)
        # compress image if larger than 512x512
        img = Image.open(io.BytesIO(image.file.read()))
        if img.width > 512 or img.height > 512:
            img.thumbnail((512, 512))
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            # create new UploadFile object using BytesIO
            image = buffer
        else:
            image = image.file.read()
        output = pix2pix(image_file=image, prompt=prompt, negative_prompt=negative_prompt, num_outputs=num_outputs, num_inference_steps=num_inference_steps, guidance_scale=guidance_scale, image_guidance_scale=image_guidance_scale, scheduler=scheduler, seed=seed)
        return success(output)
    except:
        return error(traceback.format_exc())

@app.post("/api/img2text/")
async def run_img2text(image: UploadFile = File(...)):
    try:
        img = Image.open(io.BytesIO(image.file.read()))
        if img.width > 512 or img.height > 512:
            img.thumbnail((512, 512))
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            # create new UploadFile object using BytesIO
            image = buffer
        else:
            image = image.file.read()
        output = img2text(image)
        return success(output)
    except:
        return error(traceback.format_exc())

@app.post("/api/sam/")
async def run_sam(image: UploadFile = File(...)):
    try:
        img = Image.open(io.BytesIO(image.file.read()))
        if img.width > 512 or img.height > 512:
            img.thumbnail((64, 64))
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            # create new UploadFile object using BytesIO
            image = buffer
        else:
            image = image.file.read()
        output = sam(image)
        return success(output)
    except:
        return error(traceback.format_exc())
    


@app.post("/api/sam-local/")
async def run_sam_local(image: UploadFile = File(...)):
    # try:
    #     img = Image.open(io.BytesIO(image.file.read()))
    #     if img.width > 512 or img.height > 512:
    #         img.thumbnail((64, 64))
    #         buffer = io.BytesIO()
    #         img.save(buffer, format="PNG")
    #         # create new UploadFile object using BytesIO
    #         image = buffer
    #     else:
    #         image = image.file.read()
    #     output = sam(image)
    #     return success(output)
    # except:
    #     return error(traceback.format_exc())
    # from segment_anything import sam_model_registry
    sam = sam_model_registry["default"](checkpoint="./models/segment_anything/sam_vit_h_4b8939.pth")

@app.post("/api/evaluate/")
async def run_evaluate(image: UploadFile = File(...), prompts: str = Form('" 这个英文是一段根据img生成的prompts, 请帮我用中文为用户的图片进行评价。请注意我给你的是一张衣服的平面图, 请忽略不符合逻辑的promps词。字数应该限制在30-50字')):
    try:
        image = operate_image(image, w=512, h=512)
        text_data = img2text(image)
        output = chatgpt({"messages": [{"role": "user", "content": text_data + prompts}]})
        return success(output['response'])
    except:
        return error(traceback.format_exc())

class History(BaseModel):
    # bot | user
    role: str
    msg_type: str
    content: str
    metadata: Optional[Any]
    

class ChatRequest(BaseModel):
    history: List[History]
    

def history_to_messages(history):
    res = list()
    for x in history:
        x = x.dict()
        role = x['role'] if x['role'] != 'bot' else 'system'
        if x["msg_type"] != 'text':
            continue
        res.append({
            "role": role,
            "content": x['content']
        })
    return res

# @app.post("/api/generate_image/")
# async def run_chat(body: ChatRequest):
class ChatResponse(BaseModel):
    # image | text
    msg_type: str
    content: str
    # 这个一定会带回来
    metadata: Optional[Any]

@app.post("/api/chat/")
async def run_chat(body: ChatRequest):
    history = body.history
    try:
        lastest_msg = history[-1].dict()
        # TODO: pix2pix
        if lastest_msg['msg_type'] == "image":
            filename = lastest_msg['content']
            image = open('/var/www/html/imgs/' + filename, 'rb')
            text_data = img2text(image)
            output = chatgpt([{"role": "user", "content": text_data + '这个英文是一段根据img生成的prompts, 请帮我用中文为用户的图片进行评价。请注意我给你的是一张衣服的平面图, 请忽略不符合逻辑的promps词。字数应该限制在30-50字'}])
            reply = output['response']
            return {
                "msg_type": "text",
                "content": reply
            }
        if lastest_msg['msg_type'] == "text":
            messages = history_to_messages(history)
            reply, _ = chatgpt(messages)
            return {
                "msg_type": "text",
                "content": reply
            }
        return error("error")
    except:
        return error(traceback.format_exc())
