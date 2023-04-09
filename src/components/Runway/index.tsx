import React from 'react';
import styles from './index.module.scss';
import _ from 'underscore';
import DemoClothImg from '../../assets/imgs/demo-cloth.png';
import SvgMask from '../SvgMask';
import { runModel } from '../../utils/model';
import { getDemoImg1 } from '../../utils/loadDemoImg';
import { Tensor } from 'onnxruntime-common';
import { modelInputProps } from '../../utils/Interface';
import ClipImage from '../ClipImg';

export const Runway: React.FC<{
  onSelected?: (blob: Blob) => void;
  onSvgSelected?: (obj: {svg: string, x: number, y: number, img: string}) => void;
}> = ({onSelected, onSvgSelected}) => {
  const [imgUrl, setImgUrl] = React.useState<string | undefined>(undefined);
  const [svg, setSvg] = React.useState<string | undefined>(undefined);
  const [modelScale, setModelScale] = React.useState<{
    upscale: number,
    scale: number,
    width: number,
    height: number,
    maskWidth: number,
    maskHeight: number,
    onnxScale: number,
    uploadScale: number,
  }>({
    upscale: 1,
    scale: 1,
    width: 600,
    height: 600,
    maskWidth: 600,
    maskHeight: 600,
    onnxScale: 1,
    uploadScale: 1,
  })
  const [tensor, setTensor] = React.useState<Tensor>();

  const loadDemoPic = async () => {
    const imgInfo = await getDemoImg1();
    console.log("imgInfo", imgInfo)
    const { url, blob, tensor, modelScale } = imgInfo;
    setImgUrl(url)
    setModelScale(modelScale)
    setTensor(tensor)
  }

  const pureSelectSvgRef = React.useRef<SVGSVGElement>(null);



  const run = async (clicks: Array<modelInputProps>) => {
    if (!imgUrl || !tensor || !modelScale) {
      return;
    }
    // 防抖动
    const func = await _.debounce(async () => {
      console.log("clicks", clicks)
      const result = await runModel(clicks, tensor, modelScale)
      setSvg(result?.svgStr)
      console.log("result", result)
      // wait 1000ms
      setTimeout(() => {
        console.log("pureSelectSvgRef.current", pureSelectSvgRef.current)
        if (pureSelectSvgRef.current) {
          // const { width, height } = pureSelectSvgRef.current.getBBox();
          // const { left, top } = pureSelectSvgRef.current.getBoundingClientRect();
          // const clickX = left + width / 2;
          // const clickY = top + height / 2;
          // runClick(clickX, clickY);
        }
      }, 1000)
    }, 15)
    func()
  }

  const runClick = (clickX: number, clickY: number) => {
    if (!imgUrl || !tensor || !modelScale) {
      return;
    }
    const click = {
      x: clickX * modelScale.scale,
      y: clickY * modelScale.scale,
      width: modelScale.width,
      height: modelScale.height,
      clickType: 0,
    }
    run([click])
  }

  React.useEffect(() => {
    loadDemoPic()
  }, [])

  React.useEffect(() => {
    onSvgSelected?.({
      svg: svg!,
      x: modelScale.width * modelScale.uploadScale,
      y: modelScale.height * modelScale.uploadScale,
      img: imgUrl!,
    })
  }, [
    svg,
    modelScale.width,
    modelScale.height,
    modelScale.uploadScale,
    imgUrl,
    onSvgSelected,
  ])


  return (
    <div className={styles.Runway} onClick={(e) => {
      const { clientX, clientY } = e;
      const { left, top } = e.currentTarget.getBoundingClientRect();
      const clickX = clientX - left;
      const clickY = clientY - top;
      runClick(clickX, clickY);
    }}>
      {/* {svg && imgUrl && <ClipImage svgPath={svg} imgPath={imgUrl} onClip={(blob) => {
        if (!blob) {
          return
        }
        onSelected?.(blob)
      }} />} */}
      <img className={styles.img} src={imgUrl} alt="demo-cloth" />
      <div className={styles.select}>
        <SvgMask
          xScale={modelScale.width * modelScale.uploadScale}
          yScale={modelScale.height * modelScale.uploadScale}
          // svgStr="M 0 0 L 100 0 L 100 100 L 0 100 Z"
          svgStr={svg!}
          img={imgUrl}
          selected
          // pure
        />
      </div>
      <div style={{
        // opacity: 0,
        position: 'absolute',
        zIndex: -1,
      }}>
        <SvgMask
          xScale={modelScale.width * modelScale.uploadScale}
          yScale={modelScale.height * modelScale.uploadScale}
          // svgStr="M 0 0 L 100 0 L 100 100 L 0 100 Z"
          svgStr={svg!}
          img={imgUrl}
          id='draw-clip'
          // selected
          pure
          onChange={(svg) => {
            // onSvgSelected?.(svg as any)
          }}
        />
      </div>
    </div>
  )
}
