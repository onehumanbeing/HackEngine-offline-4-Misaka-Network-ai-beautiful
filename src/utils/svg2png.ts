import html2canvas from "html2canvas";

export function convertSvgToPngBlob(svgElement: any) {
  // 创建一个canvas元素来绘制SVG元素
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const svgRect = svgElement.getBoundingClientRect();
  
  // 设置canvas的大小
  canvas.width = svgRect.width;
  canvas.height = svgRect.height;
  
  // 将SVG元素绘制到canvas上
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
  const svgUrl = URL.createObjectURL(svgBlob);
  
  // 使用html2canvas库将canvas转换为PNG Blob
  return html2canvas(svgElement, {canvas: canvas})
    .then(function(canvas) {
      const imageData = canvas.toDataURL('image/png');
      const blob = dataURItoBlob(imageData);
      URL.revokeObjectURL(svgUrl);
      return blob;
    });

  // 将dataURI转换为Blob对象
  function dataURItoBlob(dataURI: any) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }
}
