import React from 'react';
import styles from './index.module.scss';
import { Runway } from '../Runway';
import SvgMask from '../SvgMask';
import html2canvas from 'html2canvas';
import { API } from '../../api/rest';

export const MainStage: React.FC<{}> = () => {
  const [svgInfo, setSvgInfo] = React.useState<any>()
  const clothRef = React.useRef<HTMLDivElement>(null);
  return (
    <div className={styles.MainStage}>
      <div className={styles.bg} />
      <div className={styles.effect} />
      <div className={styles.container}>
        <div className={`${styles.side} ${styles.left}`} />
        <div className={`${styles.side} ${styles.right}`}>
          <div ref={clothRef}>
            {svgInfo?.svg && svgInfo?.img && svgInfo?.x && svgInfo?.y &&(
              <SvgMask
              svgStr={svgInfo?.svg}
              xScale={svgInfo?.x}
              yScale={svgInfo?.y}
              img={svgInfo?.img}
              id="case"
              pure
            />)}
          </div>
          <button onClick={() => {
            if (clothRef.current) {
              html2canvas(clothRef.current).then((canvas) => {
                const img = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = img;
                a.download = 'cloth.png';
                // a.click();
                API.uploadImg(img).then((res: any) => {
                  console.log(res)
                })

                alert('添加成功');
              })
            }
          }}>添加到衣柜</button>
          <button>衣柜找同款</button>
          <button>商家找同款</button>
        </div>
        <div className={`${styles.stage}`}>
          <div className={styles.intro}>
            <div className={styles.head} />
            <div className={styles.title}>潮流风格搭配</div>
            <div className={styles.brief}>
              先打一些东西在这里，当做是服装的文字介绍，以后让ChatGPT自动生成。
              先打一些东西在这里，当做是服装的文字介绍，以后让ChatGPT自动生成。
              先打一些东西在这里，当做是服装的文字介绍，以后让ChatGPT自动生成。
            </div>
          </div>
          <Runway onSvgSelected={setSvgInfo} />
        </div>
      </div>
    </div>
  )
}
