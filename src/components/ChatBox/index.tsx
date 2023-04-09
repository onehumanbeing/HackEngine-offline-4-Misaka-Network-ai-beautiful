import React from "react";
import styles from "./index.module.scss";
import { IconBtn } from "../IconBtn";
import shopIcon from "../../assets/imgs/icons/shop.svg";
import { GlobalContext, TChat } from "../GlobalContext";
import UploadImg from "../../assets/imgs/icons/upload.svg";
import SendImg from "../../assets/imgs/icons/send.svg";
import BotChatBoyAvatarImg from "../../assets/imgs/bot-chat-boy-avatar.png";
import { API } from "../../api/rest";
import { uniqueId } from "underscore";

export const transHistory = (chats: TChat[]) => {
  return chats.map((chat: TChat) => {
    return {
      role: chat.role,
      msg_type: chat.type,
      content: chat.content,
      metadata: chat.metadata,
    }
  });
}

export const ChatBubble: React.FC<{
  role: string;
  type: string;
  content: string;
  hideAvatar?: boolean;
}> = ({ role, type, content, hideAvatar }) => {
  const getPosition = () => {
    if (role === "user") {
      return styles.user;
    } else if (role === "bot") {
      return styles.bot;
    } else {
      return styles.middle;
    }
  };
  return (
    <div className={`${styles.ChatBubble} ${getPosition()} ${hideAvatar && styles.hideAvatar}`}>
      <img className={styles.avatar} src={BotChatBoyAvatarImg} alt="bot" />
      { type === "text" && (
        <div className={styles.text}>
          {content}
        </div>
      ) }
      {
        type === "image" && (
          <img src={content} className={styles.img} alt="" />
        )
      }
    </div>
  );
};

export const ChatBox: React.FC<{}> = () => {
  const {
    // cart,
    chats,
    setChats,
  } = React.useContext(GlobalContext);
  const [input, setInput] = React.useState<string>();
  // const chats = [
  //   {
  //     id: "1",
  //     role: "bot",
  //     type: "text",
  //     content: "你好，我是简搭AI，有什么可以帮到你的吗？",
  //   },
  //   {
  //     id: "2",
  //     role: "user",
  //     type: "text",
  //     content: "我想买一件衣服",
  //   },
  //   {
  //     id: "3",
  //     role: "bot",
  //     type: "text",
  //     content: "好的，我为你推荐一些衣服",
  //   },
  //   {
  //     id: "4",
  //     role: "bot",
  //     type: "image",
  //     content:
  //       "https://img.alicdn.com/imgextra/i4/2200000000000/O1CN01Q2Z7Zg1JZQZ2Z7Zg1_!!2200000000000-0-beehive-scenes.jpg_430x430q90.jpg",
  //   },
  //   {
  //     id: "5",
  //     role: "bot",
  //     type: "text",
  //     content: "你喜欢哪一件呢？",
  //   },
  //   {
  //     id: "6",
  //     role: "bot",
  //     type: "image",
  //     content:
  //       "https://img.alicdn.com/imgextra/i4/2200000000000/O1CN01Q2Z7Zg1JZQZ2Z7Zg1_!!2200000000000-0-beehive-scenes.jpg_430x430q90.jpg",
  //   },
  //   {
  //     id: "7",
  //     role: "bot",
  //     type: "text",
  //     content: "你喜欢哪一件呢？",
  //   },
  // ];

  const [position, setPosition] = React.useState<[number, number]>([200, 100]);

  const send = async () => {
    if (!input) {
      return;
    }

    const history = transHistory(chats);

    const user = [{
      id: uniqueId(),
      role: "user" as any,
      type: "text" as any,
      content: input,
    }]

    setChats([...chats, ...user])
    setInput("");
    const res = await API.sendChat({history});
    console.log(res);
    setChats([...chats, ...user, {
      id: uniqueId(),
      role: "bot",
      type: res?.msg_type,
      content: res?.content,
      metadata: res?.metadata,
    }])
  }

  const upload = async () => {
    // 打开窗口选择文件
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = async () => {
      if (!input?.files?.[0]) {
        return
      }
      const file = input.files[0];
      console.log(file)
      const res = await API.uploadImg(file);
      console.log(res);
      const user = [
        {
          id: uniqueId(),
          role: "user" as any,
          type: "image" as any,
          content: `https://cloth.sinkstars.com/imgs/${res?.url}`,
        }
      ]

      const history = transHistory(chats);

      const resChat = await API.sendChat({history});

      console.log(res);
      setChats([...chats, ...user, {
        id: uniqueId(),
        role: "bot",
        type: res?.msg_type,
        content: res?.content,
        metadata: res?.metadata,
      }])

      // const user = [
      //   {
      //     id: uniqueId(),
      //     role: "user" as any,
      //     type: "image" as any,
      //     content: res?.url,
      //   }
      // ]
    }
  }

  return (
    <div className={styles.ChatBox}>
      <div
        className={`${styles.container} ${styles.closed}`}
        style={{
          left: position[0],
          top: position[1],
        }}
      >
        <div className={styles.chatContent}>
          <div className={styles.header}>
            <div className={styles.left}>
              <div className={styles.title}>AI美</div>
            </div>
            <div className={styles.right}>
              <IconBtn icon={shopIcon} />
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.chat}>
              {chats.map((chat, index) => {
                return (
                  <ChatBubble
                    key={index}
                    role={chat.role}
                    type={chat.type}
                    content={chat.content}
                    hideAvatar={
                      index ? chats[index - 1].role === chat.role : false
                    }
                  />
                );
              })}
            </div>
          </div>
          <div className={styles.footer}>
            <input
              className={styles.input}
              type="text"
              placeholder="请在这里输入您的信息"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className={styles.btns}>
              <div className={styles.btn}>
                <img alt="upload" src={UploadImg} onClick={upload} />
              </div>
              <div className={styles.btn}>
                <img alt="send" src={SendImg} onClick={send} />
              </div>
            </div>
          </div>
        </div>
        <div
          className={styles.dragger}
          onMouseDown={(e) => {
            const lastClickPosition = [e.clientX, e.clientY];
            const handleMouseMove = (e: MouseEvent) => {
              // console.log(e.clientX, e.clientY, lastClickPosition, position);
              setPosition([
                position[0] + e.clientX - lastClickPosition[0],
                position[1] + e.clientY - lastClickPosition[1],
              ]);
            };
            const handleMouseUp = (e: MouseEvent) => {
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
        >
          <div className={styles.draggerCircle}></div>
          <div className={styles.draggerCircle}></div>
          <div className={styles.draggerCircle}></div>
        </div>
      </div>
    </div>
  );
};
