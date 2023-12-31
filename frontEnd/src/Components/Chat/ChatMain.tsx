import "./ChatMain.css";
import Sidebar from "./Sidebar";
import Chats from "./Chats";
import { useEffect, useState } from "react";
import axios from "axios";
import sendBtn from "/send.svg";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const ChatContainer = () => {
  const [typedText, setTypeText] = useState("");
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>(
    []
  );

  const [selectedConversation, setSelectedConversation] = useState(1);

  const userid = Cookies.get("userid");
  const navigate = useNavigate();

  if (!userid) {
    navigate("/login");
  }

  const handleTypedText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypeText(e.target.value);
  };

  const handleTextSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    console.log(typedText);

    const userMessage = {
      text: typedText,
      isBot: false,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    console.log(messages);

    const userid = Cookies.get("userid");

    axios
      .post("http://localhost:5000/send_msg", {
        typedText,
        userid,
        selectedConversation,
      })
      .then((res) => {
        console.log(res.data.user_msg);
        if (res.data.user_msg === "no match") {
          let botResponse = res.data.answer;
          let botMessage = {
            text: botResponse,
            isBot: true,
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        } else {
          const responseTypes = ["disease", "causes", "treatment"];

          responseTypes.forEach((type) => {
            let botResponse = res.data[type];
            if (botResponse == "") {
              return;
            }
            let botMessage = {
              text: botResponse,
              isBot: true,
            };

            setMessages((prevMessages) => [...prevMessages, botMessage]);
          });
        }
      })
      .catch((err) => {
        console.log("Message sent failed : ", err);
      });

    setTypeText("");
  };

  const handleSelectConversation = (index: number) => {
    setSelectedConversation(index);
    window.scrollTo(0, document.body.scrollHeight);
  };

  useEffect(() => {
    const userid = Cookies.get("userid");

    if (!userid) {
      navigate("/login");
    }

    axios
      .get("http://localhost:5000/get_messages", {
        params: {
          userid: userid,
          selectedConversation: selectedConversation,
        },
      })
      .then((response) => {
        console.log(response.data);
        const fetchedMessages = response.data.messages;

        setMessages(
          fetchedMessages.map((message: { msg: string; isBot: boolean }) => ({
            text: message.msg,
            isBot: message.isBot,
          }))
        );

        window.scrollTo(0, document.body.scrollHeight);
      })
      .catch((error) => {
        console.error("Error fetching user messages :", error);
      });
  }, [selectedConversation]);

  window.scrollTo(0, document.body.scrollHeight);
  return (
    <div className="App">
      <Sidebar onSelectedConversation={handleSelectConversation} />
      <div className="main md:pl-2 lg:pl-80">
        <Chats messages={messages} />
        <div className="chatFooter mt-2">
          <form className="inp text-2xl" onSubmit={handleTextSubmit} action="">
            <input
              name="typedText"
              type="text"
              placeholder="Send a message"
              onChange={handleTypedText}
              value={typedText}
            />
            <button className="send" type="submit">
              <img src={sendBtn} alt="Send" />
            </button>
          </form>
          <p>
            Free Research Preview. Doctor Health may produce inaccurate
            information about deases,curing or facts
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
