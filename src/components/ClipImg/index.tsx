import React, { useRef } from 'react';

function ClipImage({ svgPath, imgPath, onClip }: {
  svgPath: string;
  imgPath: string;
  onClip?: (blob: Blob) => void;
}) {
  const canvasRef = useRef<any>(null);

  const handleLoad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imgPath;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Create SVG element and set its path
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', svgPath);
      svg.appendChild(path);

      // Convert SVG to image data
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
      const svgImg = new Image();
      svgImg.src = svgUrl;
      svgImg.onload = () => {
        // Create filter and set its attributes
        const filter = ctx.createSVGFilter();
        filter.setAttribute('x', '0');
        filter.setAttribute('y', '0');
        filter.setAttribute('width', canvas.width);
        filter.setAttribute('height', canvas.height);
        filter.setAttribute('filterUnits', 'userSpaceOnUse');
        filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
        filter.innerHTML = `<feImage xlink:href="${imgPath}" x="0" y="0" width="${canvas.width}" height="${canvas.height}" />` +
                           `<feComposite operator="in" in2="SourceGraphic" />`;

        // Apply filter to canvas
        ctx.filter = `url(#${filter.id})`;
        ctx.drawImage(svgImg, 0, 0);

        // Crop image to remove transparent edges
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { width, height, data } = imageData;
        let top = height, bottom = 0, left = width, right = 0;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            if (data[index + 3] !== 0) {
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
              left = Math.min(left, x);
              right = Math.max(right, x);
            }
          }
        }
        const cropped = ctx.getImageData(left, top, right - left + 1, bottom - top + 1);
        canvas.width = cropped.width;
        canvas.height = cropped.height;
        ctx.putImageData(cropped, 0, 0);

        // Export image as Blob
        canvas.toBlob((blob: Blob) => {
          // Do something with the blob, e.g. upload to server or download as file
          console.log("clip", blob);
          onClip && onClip(blob);
        }, 'image/png');
      };
    };
  };

  return (
    <div>
      <canvas ref={canvasRef} onLoad={handleLoad} style={{ display: 'none' }} />
    </div>
  );
}

export default ClipImage;
