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
    socket.on("message", onMessageReceived);
    socket.on("newGroup", onGroupCreated);

    socket.on("disconnect", (reason) => {
      console.log("disconnected", reason);
    });

    socket.on("connect", (reason) => {
      console.log("user connect", reason);
    });

    socket.on("reconnect", () => {
      console.log("reconnected");
    });

    return () => {
      socket.off("connected", onConnected);
      socket.off("message", onMessageReceived);
      socket.off("newGroup", onGroupCreated);
    };
  }, [socket]);

  const sendMessage = async () => {
    // const res = await fetch("http://localhost:8080/admin/chat/sendMessage", {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     user: { id: "shobhitsaini709@gmail.com", type: "internal_user" },
    //     message,
    //     groupId: room,
    //     messageType: "test",
    //   }),
    // });

    // const data = await res.json();
    // console.log(data);
    if (socket.connected) {
      if (room) {
        socket.emit("sendMessage", message, room);
      } else {
        socket.emit("sendMessage", message);
      }
    } else {
      socket.connect();
      if (room) {
        socket.emit("sendMessage", message, room);
      } else {
        socket.emit("sendMessage", message);
      }
    }
  };

  const joinRoom = () => {
    socket.emit("joinRoom", room);
  };

  useEffect(() => {
    const socket = io("https://younglabs-apis-uat-742lbomu3a-el.a.run.app", {
      reconnection: true,
      reconnectionDelay: 5000,
    });

    setSocket(socket);
  }, []);

  const connectWithSocket = async () => {
    console.log(socket.connected);
    if (socket.connected) {
      socket.disconnect();
    } else {
      socket.connect();
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
      <button onClick={joinRoom}>Join Room</button>
      {socket && (
        <button onClick={connectWithSocket}>
          {socket.connected ? "disconnect" : "connect"}
        </button>
      )}
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <span>{message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
