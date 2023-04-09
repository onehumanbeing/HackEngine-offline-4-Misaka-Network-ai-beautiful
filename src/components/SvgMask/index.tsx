import React, { useContext, useEffect, useState, useRef } from "react";
import { convertSvgToPngBlob } from "../../utils/svg2png";

interface SvgMaskProps {
  xScale: number;
  yScale: number;
  svgStr: string;
  color?: string | undefined;
  id?: string | undefined;
  className?: string | undefined;
  img?: string | undefined;
  selected?: boolean | undefined;
  pure?: boolean;
  onChange?: (blob: Blob) => void;
}

const SvgMask = ({
  xScale,
  yScale,
  svgStr,
  img,
  id = "",
  className = "",
  selected,
  pure,
  onChange,
}: SvgMaskProps) => {
  const [key, setKey] = useState(Math.random());
  const [boundingBox, setBoundingBox] = useState<DOMRect | undefined>(
    undefined
  );
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const getBoundingBox = () => {
    if (!pathRef?.current) return;
    setBoundingBox(pathRef.current.getBBox());
  };
  useEffect(() => {
    setKey(Math.random());
    getBoundingBox();
  }, [svgStr]);
  const bbX = boundingBox?.x;
  const bbY = boundingBox?.y;
  const bbWidth = boundingBox?.width;
  const bbHeight = boundingBox?.height;
  const bbMiddleY = bbY && bbHeight && bbY + bbHeight / 2;
  const bbWidthRatio = bbWidth && bbWidth / xScale;

  React.useEffect(() => {
    if (!onChange) {
      return;
    }
    console.log("svgRef Current", svgRef.current)
    if (svgRef.current) {
      // 用canvas裁剪边缘并转化为png blob
      // const canvas = document.createElement("canvas");
      // const ctx = canvas.getContext("2d");
      // if (!ctx) return;
      // const { width, height } = svgRef.current.getBBox();
      // canvas.width = width;
      // canvas.height = height;
      // const svgData = new XMLSerializer().serializeToString(svgRef.current);
      // const DOMURL = window.URL || window.webkitURL || window;
      // const img = new Image();
      // const svg = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      // const url = DOMURL.createObjectURL(svg);
      // img.onload = function () {
      //   console.log("img onload")
      //   ctx.drawImage(img, 0, 0);
      //   DOMURL.revokeObjectURL(url);
      //   canvas.toBlob((blob) => {
      //     console.log("blob", blob)
      //     onChange(blob!);
      //   });
      // }
      convertSvgToPngBlob(svgRef.current).then((blob) => {
        console.log("blob", blob)
        onChange(blob!);
      })
    }
  }, [svgStr, onChange])

  return (
    <svg
      className={`absolute w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${xScale} ${yScale}`}
      key={key}
      ref={svgRef}
    >
      {!pure && bbX && bbWidth && (
        <>
          <radialGradient
            id={"gradient" + id}
            cx={0}
            cy={0}
            r={bbWidth}
            gradientUnits="userSpaceOnUse"
            gradientTransform={`translate(${bbX - bbWidth / 4},${bbMiddleY})`}
          >
            <stop offset={0} stopColor="white" stopOpacity="0"></stop>
            <stop offset={0.25} stopColor="white" stopOpacity={0.7}></stop>
            <stop offset={0.5} stopColor="white" stopOpacity="0"></stop>
            <stop offset={0.75} stopColor="white" stopOpacity={0.7}></stop>
            <stop offset={1} stopColor="white" stopOpacity="0"></stop>
            <animateTransform
              attributeName="gradientTransform"
              attributeType="XML"
              type="scale"
              from={0}
              to={12}
              dur={`1.5s`}
              begin={".3s"}
              fill={"freeze"}
              additive="sum"
            ></animateTransform>
          </radialGradient>
        </>
      )}
      <clipPath id={"clip-path" + id}>
        <path d={svgStr} />
      </clipPath>
      {!pure && (
        <filter id={"glow" + id} x="-50%" y="-50%" width={"200%"} height={"200%"}>
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#1d85bb" />
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#1d85bb" />
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#1d85bb" />
        </filter>
      )}
      <image
        width="100%"
        height="100%"
        xlinkHref={img}
        clipPath={`url(#clip-path${id})`}
      />
      {!pure && (
        <>
          {selected && bbWidthRatio && (
            <path
              id={"mask-gradient" + id}
              className={`mask-gradient ${
                bbWidthRatio > 0.5 && window.innerWidth < 768 ? "hidden" : ""
              }`}
              d={svgStr}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0"
              fillOpacity="1"
              fill={`url(#gradient${id})`}
            />
          )}
          <path
            id={"mask-path" + id}
            className="mask-path"
            d={svgStr}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity=".8"
            fillOpacity="0"
            stroke="#1d85bb"
            strokeWidth="3"
            ref={pathRef}
            filter={`url(#glow${id})`}
          />
        </>
      )}
    </svg>
  );
};

export default SvgMask;
// export {}