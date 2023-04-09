response = openai.Image.create_edit(
  image=open("./imgs/example3.png", "rb"),
  mask=open("./imgs/mask3.png", "rb"),
  prompt="A white mink coat with black spots for women",
  n=1,
  size="1024x1024"
)
image_url = response['data'][0]['url']
print(image_url)