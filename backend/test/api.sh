curl -s -X POST \
  -d '{"version": "30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f", "input": {"prompt": "cool fasion style for teenages", "image": "https://cdn.discordapp.com/attachments/1074579438123110480/1094373093541158962/Henry_HT_an_flat_image_for_Fleece_jacket__without_anything_else_b7b7b36d-fdec-448f-9e5e-f228500528f3.png"}}' \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H 'Content-Type: application/json' \
  "https://api.replicate.com/v1/predictions"
