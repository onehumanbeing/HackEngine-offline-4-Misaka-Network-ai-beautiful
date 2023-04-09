import replicate
import os
import requests
from PIL import Image

def chatgpt(messages):
    url = 'https://agent.zsrtech.com/chat'
    request_data = list()
    # request_data.extend(PROMPTS)
    request_data.extend(messages)
    response = requests.post(url, proxies={"http_proxy": "127.0.0.1:1087", "https_proxy": "127.0.0.1:1087"}, json={"messages": request_data})
    print(response.text)
    reply = response.json()['response']
    # if reply.find("@pix2pix") != -1:
    #     print("run @pix2pix")
    #     output = pix2pix_for_chatgpt(reply)
    #     return reply, output
    return reply, None
    

# {"status":0,"msg":"Success","data":["https://replicate.delivery/pbxt/pJlQW6xUBIK8EF1dTJOhGfOkeOsytX0ZoDyUydq0poElVAwQA/out-0.png"]}
def pix2pix(image_file, prompt=None, negative_prompt=None, num_outputs=1, num_inference_steps=500, guidance_scale=7.5, image_guidance_scale=1.5, scheduler="DPMSolverMultistep", seed=None):
    # 调用 replicate.run() 函数，并传递文件路径
    input_fields = {"image": image_file, "num_outputs": num_outputs, "num_inference_steps": num_inference_steps, "guidance_scale": guidance_scale, "image_guidance_scale": image_guidance_scale, "scheduler": scheduler}
    if negative_prompt:
        input_fields["negative_prompt"] = negative_prompt
    if prompt:
        input_fields['prompt'] = prompt
    if seed:
        input_fields["seed"] = seed
    output = replicate.run("timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f", input=input_fields)
    return output

def img2text(image_file):
    output = replicate.run(
        "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
        input={"image": image_file}
    )
    return output

def sam(image_file):
    output = replicate.run(
        "pablodawson/segment-anything-automatic:14fbb04535964b3d0c7fad03bb4ed272130f15b956cbedb7b2f20b5b8a2dbaa0",
        input={"image": image_file}
    )
    return output

PROMPTS = [
    {
        "role": "user",
        "content": "you are more than a chatbot, you can call function to achieve extra operations beyond a chatbot." \
        "when user uploaded an image, you can considered the img_path as a input." \
        "当我上传了图片并且提出了自己的要求时，你必须立刻回复并调用下面的函数来解决我的问题。" \
        "其他情况下，请记住你依然是一个对话机器人，并且使用中文回答我的问题。" \
        "now I will tell you what functions can you call. 当你调用时，必须给出对应的input" \
        '我提出的需求一定和服装的更换有关，在更换时你必须根据你的建议增加关于材质，款式等prompts词汇，prompts必须是英文'
    },
    {
        "role": "user",
        "content": 'pix2pix is a function for you(chatGpt), it can Instruct Image Using Text. ' \
        'useful when you(chatGpt) want to the style of the image to be like the text.' \
        "The input to this tool should be a comma separated string of three" \
        "representing the image_path and the prompts text and the negative prompt" \
        "here is an example: @pix2pix, ./imgs/red_dress_1.png, A uniquely-styled dress for a young child, model and adult" \
        "the negative prompt is option and you(chatGpt) can keep it empty if you(chatGpt) don't need it, but comma is necessary." \
        "if you(chatGpt) want to call this function, just give this format below without anything else:\n" \
        "Please notice you(chatGpt) should use english to call a function, when you(chatGpt) call the function in the correct format, please don't output anything else in the message and not needable to reply like a speaker." \
        "when you need to achieve user's request of generate image based on image and text, you can call this function, considered as image generated." \
        'in your prompt you should contain a least one verbel related with clothes, and this verbal should not be a polyseme, such as coat. you should ' \
    }
]

# @prompts(name="Instruct Image Using Text",
#          description="useful when you want to the style of the image to be like the text. "
#                      "like: make it look like a painting. or make it like a robot. "
#                      "The input to this tool should be a comma separated string of two, "
#                      "representing the image_path and the text. ")

def pix2pix_for_chatgpt(msg):
    # msg = """
    # Okay, I understand that you want to change the color of your windbreaker to blue. To perform this operation, we can use the pix2pix function as follows:
    # @pix2pix, ./imgs/example2.png, Change the color of the windbreaker to blue.
    # Please note that the execution of this function may take some time, and the resulting image may not always be perfect. But we will give it a try.
    # """
    msg = msg[msg.find("@pix2pix"): ]
    msg = msg[:msg.find(".\n")]
    data = msg.split(",")
    img_path = data[1].strip()
    prompts = data[2].strip()
    non_prompts = data[3].strip() if len(data) > 3 else ''
    output = pix2pix(open(img_path, "rb"), prompts, non_prompts)
    return output

def test_chating():
    # r = pix2pix_for_chatgpt("@pix2pix, ./imgs/example2.png, Replace the coat color with blue.")
    # print(r) 
    # exit()
    msgs = [
        {"role": "user", "content": "I uploaded an image: 路径是./imgs/example3.png, 你可以用来调用模型"},
        {"role": "user", "content": "我想要穿上一件淡紫色花纹的外套"}
    ]
    while True:
        reply, output = chatgpt(msgs)
        print(reply, output)
        rs = input()
        msgs.append({"role": "user", "content": rs})
        

if __name__ == "__main__":
    test_chating()
