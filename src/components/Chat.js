import React, { useState, useEffect } from "react";
import { ChatDiv } from "../styledComponents/ChatDiv";
import { GoMute } from "react-icons/go";
import { GoUnmute } from "react-icons/go";
import { MdSend } from "react-icons/md";
import Sound from "./Sound";
import GiphyModal from "./GiphyModal";

export default function Chat({ sock, connection }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [gif, setGif] = useState(undefined);
  const [chatSound, setChatSound] = useState(true);

  function handleSound() {
    setChatSound(!chatSound);
  }

  function handleChange(e) {
    setMessage(e.target.value);
  }

  function handleEnterKey(event) {
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("chat-btn").click();
    }
  }
  function closePreview() {
    if (gif) {
      const preview = document.getElementById("gif-preview");
      while (preview.childNodes.length > 0) {
        preview.removeChild(preview.childNodes[0]);
      }
      setGif(undefined);
    }
    return;
  }

  function sendMessage() {
    const playerName = connection
      ? connection.ens || connection.userAddress
      : "";
    // eslint-disable-next-line
    let displayAddress;
    if (
      playerName.includes(".eth") ||
      playerName === "" ||
      playerName === "Not connected"
    ) {
      displayAddress = playerName;
    } else {
      displayAddress = `${playerName.substring(0, 4)}...${playerName.substring(
        playerName.length - 4
      )}`.toLowerCase();
    }
    const el = document.createElement("li");
    const messageHolder = gif
      ? `${message} <br/><iframe title=${gif.title} class="chat-gif" src=${gif.embed_url} width="262" height="198" frameBorder="0" class="giphy-embed"></iframe><p><a href=${gif.url}>via GIPHY</a></p>`
      : message;

    if (sock) {
      sock.emit("sendMessage", displayAddress + ": " + messageHolder);
    }
    el.innerHTML = `${displayAddress}: ${messageHolder} `;

    document.querySelector("#chat").appendChild(el);
    setMessage("");
    const elem = document.getElementById("chat");
    elem.scrollTop = elem.scrollHeight;
    let tempChat = chat;
    tempChat.push(messageHolder);
    setChat(tempChat);
    closePreview();
  }

  let gifPreviewElement;
  if (gif) {
    gifPreviewElement = (
      <div id="gif-preview">
        <span className="gif-close" onClick={closePreview}>
          &times;
        </span>
        <div className="inner-preview">
          <iframe
            title={gif.title}
            src={gif.embed_url}
            width="240"
            height="180"
            frameBorder="0"
            className="giphy-embed"
          ></iframe>
          <p>
            <a href={gif.url}>via GIPHY</a>
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const el = document.createElement("li");
    el.innerHTML = chat[chat.length - 1] || "";
    document.getElementById("chat").appendChild(el);
    const elem = document.getElementById("chat");
    elem.scrollTop = elem.scrollHeight;
    // eslint-disable-next-line
  }, [chat]);

  if (sock) {
    sock.on("receiveMessage", (chat) => {
      setChat(chat);
    });
  }

  return (
    <ChatDiv className="chat-area">
      <h1>chat</h1>
      <ul id="chat"></ul>
      <div id="chat-input-div">
        {gif ? gifPreviewElement : null}
        <div id="gif-preview"></div>
        <div id="input-div">
          <input
            id="chat-input"
            value={message}
            onChange={handleChange}
            placeholder="Enter message"
            onKeyUp={handleEnterKey}
          ></input>
          <button
            id="chat-btn"
            disabled={message.length === 0 && gif === undefined}
            onClick={sendMessage}
          >
            <MdSend />
          </button>
        </div>
        <div className="buttonWrapper">
          <GiphyModal
            className="giphy-modal"
            setGif={setGif}
            setMessage={setMessage}
          />
          <button id="chat-mute" onClick={handleSound}>
            {chatSound ? <GoUnmute /> : <GoMute />}
          </button>
        </div>
      </div>
      <Sound chat={chat} chatSound={chatSound} />
    </ChatDiv>
  );
}
