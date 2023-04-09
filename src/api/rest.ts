const host = "https://cloth.sinkstars.com"

export const API = {
  sendChat: async (data: any) => {
    const res = await fetch(`${host}/api/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await res.json()
  },
  uploadImg: async (data: Blob | string) => {
    const formData = new FormData();
    formData.append("image", data);
    const file = await fetch(`${host}/api/upload/`, {
      method: "POST",
      // headers: {
      //   'Content-Type': 'multipart/form-data'
      // },
      body: formData,
    });
    const body = await file.json()
    return body
  }
}