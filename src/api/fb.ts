const API_ENDPOINT = "https://model-zoo.metademolab.com/predictions/segment_everything_box_model";
const ALL_MASK_API_ENDPOINT = "https://model-zoo.metademolab.com/predictions/automatic_masks";

export const requestSeg2Everything = async (blob: any) => {
  const response = await fetch(`${API_ENDPOINT}`, {
    method: "POST",
    body: blob,
  });
  const json = await response.json();
  return json;
}

export const requestAutoMask = async (blob: any) => {
  const response = await fetch(`${ALL_MASK_API_ENDPOINT}`, {
    method: "POST",
    body: blob,
  });
  const json = await response.json();
  return json;
}
