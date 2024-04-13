import "./App.css";
// import { io } from "socket.io-client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive-message", (message) => {
      console.log(message);
    });
  }, [socket]);

  const onConnected = () => {
    console.log("connected");
  };

  const onMessageReceived = (payload) => {
    console.log("receivedMessage=", payload);
    setMessages((pre) => {
      return [...pre, payload];
    });
  };

  const onGroupCreated = (payload) => {
    console.log(payload);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("connected", onConnected);
    socket.on("messageReceived", onMessageReceived);
    socket.on("newGroup", onGroupCreated);

    socket.on("disconnect", (reason) => {
      console.log("disconnected", reason);
    });

    socket.on("connect", (reason) => {
      console.log("user connect", reason);
    });

    return () => {
      socket.off("connected", onConnected);
      socket.off("messageReceived", onMessageReceived);
      socket.off("newGroup", onGroupCreated);
    };
  }, [socket]);

  const sendMessage = async () => {
    if (room && userId) {
      const res = await fetch(
        "https://younglabsapis-33heck6yza-el.a.run.app/admin/chat/sendMessage",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            user: { id: userId, type: "internal_user" },
            message,
            groupId: room,
            type: "text",
          }),
        }
      );
      const data = await res.json();
      console.log(data);
    }
  };

  const connectWithSocket = async () => {
    if (userId) {
      console.log("userId", userId);
      const socket = io("https://younglabsapis-33heck6yza-el.a.run.app", {
        auth: {
          email: userId,
          type: "internal_user",
        },
      });

      setSocket(socket);
    }
  };

  useEffect(() => {
    if (navigator.userAgent.includes("Android")) {
      console.log("android");
      window.location.href = "app://redirect.com.younglabs.android";
    }
  }, []);

  return (
    <div className="App">
      <input
        placeholder="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <input
        placeholder="User id"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <button onClick={connectWithSocket}>connect</button>
      <div>
        {messages.map((item, index) => (
          <div key={index}>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
