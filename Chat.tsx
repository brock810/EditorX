import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { addMessage } from '../redux/actions';
import io, { Socket } from 'socket.io-client';
import EmojiPicker from 'react-emoji-picker';
import emojione from 'emojione';
import AuthComponent from './AuthComponent';
type Formatting = 'bold' | 'italic' | 'underline';


interface AvatarOption {
  url: string;
  name: string;
}

const themes = {
  default: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    backgroundColor: '#1f1f1f',
    textColor: '#ffffff',
    fontFamily: 'Helvetica, Arial, sans-serif',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px rgba(255, 255, 255, 0.1)',
  },
  happy: {
    backgroundColor: '#FCECDB',
    textColor: '#FF69B4',
    fontFamily: 'Comic Sans MS, cursive, sans-serif',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px rgba(255, 105, 180, 0.3)',
    padding: '10px',
  },
  sad: {
    backgroundColor: '#c5d4e6',
    textColor: '#36454f',
    fontFamily: 'Times New Roman, Times, serif',
    borderRadius: '5px',
    border: '2px solid #36454f',
    padding: '10px',
  },
  excited: {
    backgroundColor: '#FFD700',
    textColor: '#800080',
    fontFamily: 'Impact, Charcoal, sans-serif',
    fontSize: '18px',
    padding: '10px',
  },
  summer: {
    backgroundColor: '#fde7a9',
    textColor: '#006400',
    fontFamily: 'Verdana, Geneva, sans-serif',
    fontStyle: 'italic',
    borderRadius: '5px',
    border: '2px solid #006400',
    padding: '10px',
  },
  vibrant: {
    backgroundColor: '#ffdd77',
    textColor: '#cc3333',
    fontFamily: 'Courier New, Courier, monospace',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px rgba(204, 51, 51, 0.3)',
    padding: '10px',
  },
  mystic: {
    backgroundColor: '#cc99ff',
    textColor: '#3300cc',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
    padding: '10px',
  },
  oceanic: {
    backgroundColor: '#66ccff',
    textColor: '#003366',
    fontFamily: 'Tahoma, Geneva, sans-serif',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
    padding: '10px',
  },
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const storedMessages = localStorage.getItem('chatMessages');
  if (storedMessages) {
    // Parse stored messages from localStorage
    const parsedMessages: Message[] = JSON.parse(storedMessages);
    // Ensure that each message object has a 'reactions' array
    const messagesWithReactions = parsedMessages.map((message) => ({
      ...message,
      reactions: message.reactions || [], // Ensure reactions array exists or initialize it as an empty array
    }));
    return messagesWithReactions;
  } else {
    return [];
  }
});

  const [deleteMessage, setDeleteMessage] = useState('');
  const [formatting, setFormatting] = useState<Formatting[]>([]);
  const [isBackgroundEnabled, setBackgroundEnabled] = useState(true);
  const dispatch: Dispatch = useDispatch();
  const [fileURLs, setFileURLs] = useState<{ [key: string]: string }>({});
  const [, setUploadStatus] = useState<string>('');
  const [showReactionOptions, setShowReactionOptions] = useState<boolean>(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(-1);
  const [userEmail, setUserEmail] = useState<string>('');
  const [avatarSelectedMessage, setAvatarSelectedMessage] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [theme, setTheme] = useState(themes.default);
  const [searchTerm, SetSearchTerm] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false); 
  const socketInstance: Socket = io('https://mango-guttural-cheetah.glitch.me', {
    query: {
      email: userEmail,
    },
  });

  useEffect(() => {
    socketInstance.on('connect', () => {
      console.log('Connected to the WebSocket server');
    });

    socketInstance.on('message', (message: Message) => {
      console.log('Received message:', message);
      dispatch(addMessage(message.text));
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    });

    socketInstance.on('disconnect', (reason: string) => {
      console.log('Disconnected from the WebSocket server. Reason:', reason);
    });

    socketInstance.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });

    // Listen for typing events from the server
    socketInstance.on('typing', (typing: boolean) => {
      setIsTyping(typing);
    });

    return () => {
      console.log('Component unmounted');
      socketInstance.disconnect();
    };
  }, [dispatch, socketInstance]);

  useEffect(() => {
    const typingTimeout = setTimeout(() => handleTyping(false), 2000); // Set a timeout to stop typing after 2 seconds of inactivity

    return () => {
      clearTimeout(typingTimeout);
    };
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '' || selectedAvatar !== null) {
      const message: Message = {
        text: newMessage,
        timestamp: Date.now(),
        user: userEmail,
        avatar: selectedAvatar ? selectedAvatar.url : null,
        avatarName: selectedAvatar ? selectedAvatar.name : null,
        reactions: [],
        files: uploadedFiles,
        pinned: false,
      };
  
      try {
        // Upload files if there are any
        if (uploadedFiles.length > 0) {
          await handleFileUpload(); // Upload files before sending the message
        }
  
        // Send the message
        socketInstance.emit('message', message);
  
        const updatedMessages: Message[] = [...messages, message]; // Ensure updatedMessages is of type Message[]
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
  
        setMessages(updatedMessages);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    } else {
      // Handle case where message or avatar is missing
      alert('Please enter a message and select an avatar before sending.');
    }
  };
  

  // Remove the handleFileUpload function from outside the component
  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please choose a file to upload.');
      return;
    }
  
    try {
      const formData = new FormData();
  
      uploadedFiles.forEach((file, _index) => {
        formData.append('files', file);
      });
  
      const response = await fetch('http://localhost:3005/upload', {
        method: 'Post',
        body: formData,
      });
  
      if (response.ok) {
        console.log('Files uploaded successfully');
        setUploadStatus('Files uploaded successfully'); // Set upload status message
        setTimeout(() => setUploadStatus(''), 5000); // Clear upload status message after 5 seconds
      } else {
        console.error('File upload failed');
        setUploadStatus('File upload failed'); // Set upload status message
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus('File upload failed'); // Set upload status message
      throw error; // Propagate the error to the caller
    }
  };
  
  
  const handleTyping = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      // Emit typing event to the server
      socketInstance.emit('typing', typing);
    }
  };

  const handleEditMessage = (index: number) => {
    const editedMessage = prompt('Edit the message:', messages[index]?.text);
    if (editedMessage !== null && editedMessage !== undefined) {
      socketInstance.emit('edit_message', { index, message: editedMessage });

      setMessages((prevMessages) =>
        prevMessages.map((message, i) => (i === index ? { ...message, text: editedMessage } : message))
      );

      localStorage.setItem(
        'chatMessages',
        JSON.stringify(messages.map((message, i) => (i === index ? { ...message, text: editedMessage } : message)))
      );
    }
  };

  const handleDeleteMessage = (index: number) => {
    socketInstance.emit('delete_message', index);

    setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));

    localStorage.setItem('chatMessages', JSON.stringify(messages.filter((_, i) => i !== index)));
  };

  const toggleFormatting = (type: Formatting) => {
    if (formatting.includes(type)) {
      setFormatting(formatting.filter((f) => f !== type));
    } else {
      setFormatting([...formatting, type]);
    }
  };

  const getMessageStyle = (message: string) => {
    let style = {};
    if (formatting.includes('bold')) {
      style = { ...style, fontWeight: 'bold' };
    }
    if (formatting.includes('italic')) {
      style = { ...style, fontStyle: 'italic' };
    }
    if (formatting.includes('underline')) {
      style = { ...style, textDecoration: 'underline' };
    }
    return style;
  };

  const handleEmojiSelect = (emoji: string) => {
    if (emoji) {
      const unicodeEmoji = emojione.shortnameToUnicode(emoji);
      setNewMessage(newMessage + unicodeEmoji);
    }
  };

  const avatarOptions: AvatarOption[] = [
    { url: '/avatars/CuteLadyBug.jpg', name: 'Cute Lady Bug' },
    { url: '/avatars/LadyGalavanting.jpg', name: 'Lady Galavanting' },
    { url: '/avatars/JustALilApple.jpg', name: 'Just A Lil Apple' },
    { url: '/avatars/ICarly.jpg', name: 'ICarly' },
    { url: '/avatars/CuteLittleDoggy.jpg', name: 'Cute Little Doggy' },
  ];

  const handleAvatarSelect = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar);
    setAvatarSelectedMessage(`You have selected ${avatar.name}`);

    if (uploadedFiles.length > 0) {
      const confirmDelete = window.confirm("Switching avatars will delete your uploaded files. Are you sure you want to continue?");
      if (!confirmDelete) {
        return;
      }
    }

    setUploadedFiles([]);
    setFileURLs({});
 
  };

  const filteredMessages = messages.filter(message =>
    message.text.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    );
  
  const handleReactionClick = (messageIndex: number, reactionId: number) => {
    const updatedMessages = [...messages];
    const message = updatedMessages[messageIndex];
    const reactionIndex = message.reactions.findIndex((reaction) => reaction.id === reactionId);

    if (reactionId !== -1) {

      message.reactions[reactionIndex].count++;
    } else {

      message.reactions.push ({ id: reactionId, emoji: '👍', count: 1});
    }

    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));

  }

// Inside the Chat component
const handleAvatarClick = (index: number) => {
  // Show reaction options when avatar is clicked
  setShowReactionOptions(true);
  // Remember which message's avatar was clicked
  setSelectedMessageIndex(index);
};

const handleReactionOptionClick = (reactionEmoji: string) => {
  // Add the selected reaction to the message
  const updatedMessages = [...messages];
  const message = updatedMessages[selectedMessageIndex];
  const uniqueId = Math.floor(Math.random() * 1000000);

  // Check if the message already has reactions
  if (!message.reactions) {
    message.reactions = [];
  }

  // Check if the selected reaction already exists
  const existingReaction = message.reactions.find(reaction => reaction.emoji === reactionEmoji);

  if (existingReaction) {
    // If the reaction exists, increment its count
    existingReaction.count++;
  } else {
    // If the reaction doesn't exist, add it to the reactions array
    message.reactions.push({ id: uniqueId, emoji: reactionEmoji, count: 1 });
  }

  // Update the state with the modified messages
  setMessages(updatedMessages);

  // Hide the reaction options
  setShowReactionOptions(false);

  localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const newFiles = Array.from(files);
    const newFileURLs: { [key: string]: string } = {};
    newFiles.forEach((file) => {
      const fileURL = URL.createObjectURL(file);
      newFileURLs[file.name] = fileURL;
    });
    setUploadedFiles((prevUploadedFiles) => [...prevUploadedFiles, ...newFiles]);
    setFileURLs((prevFileURLs) => ({ ...prevFileURLs, ...newFileURLs }));
  }
};

useEffect(() => {
  const newFileURLs: { [key: string]: string } = {};
  uploadedFiles.forEach((file) => {
    const fileURL = URL.createObjectURL(file);
    newFileURLs[file.name] = fileURL;
  });
  setFileURLs((prevFileURLs) => ({ ...prevFileURLs, ...newFileURLs }));
}, [uploadedFiles]);

const handleFileDelete = (fileName) => {
  // Check if the file exists in the uploadedFiles array
  const fileExists = uploadedFiles.some(file => file.name === fileName);

  if (fileExists) {
    // Remove the file from the uploadedFiles state
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));

    // Remove the file from the fileURLs state
    setFileURLs(prevFileURLs => {
      const updatedFileURLs = { ...prevFileURLs };
      delete updatedFileURLs[fileName];
      return updatedFileURLs;
    });

    // Set delete message
    setDeleteMessage(`File "${fileName}" has been deleted successfully`);
    setTimeout(() => setDeleteMessage(''), 5000); // Clear message after 5 seconds
  } else {
    // Set delete message for file not found
    setDeleteMessage(`File "${fileName}" not found`);
    setTimeout(() => setDeleteMessage(''), 5000); // Clear message after 5 seconds
  }
};

  const handlePinMessage = (index: number) => {
    const updatedMessages = [...messages];
    const pinnedMessage = updatedMessages.splice(index, 1) [0];
    pinnedMessage.pinned = !pinnedMessage.pinned;
    if (pinnedMessage.pinned) {
      updatedMessages.unshift(pinnedMessage);
    } else {
      updatedMessages.push(pinnedMessage)
    }
    setMessages(updatedMessages);
  };

  const handleThemeChange = (themeName: string) => {
    setTheme(themes[themeName]);
  };

  const toggleBackground = () => {
    setBackgroundEnabled(!isBackgroundEnabled);
  };


  return (
    <div className={`chat-container ${isBackgroundEnabled ? 'background-enabled' : ''}`}>
      <div className={`header ${isBackgroundEnabled ? 'header-dark' : ''}`} style={isBackgroundEnabled ? {} : theme}>
        <h2 className="chat-title">Chat Component</h2>
        <div className="theme-buttons">
        <button className="theme-button" onClick={() => handleThemeChange('default')}>Default Theme</button>
        <button className="theme-button" onClick={() => handleThemeChange('dark')}>Dark Theme</button>
        <button className="theme-button" onClick={() => handleThemeChange('excited')}>Excited Theme</button>
        <button className="theme-button" onClick={() => handleThemeChange('mystic')}>Mystic Theme</button>
        <button className="theme-button" onClick={() => handleThemeChange('oceanic')}>Oceanic Theme</button>
        <button className="theme-button" onClick={() => handleThemeChange('happy')}>Happy Theme</button>
        <button className="theme-button" onClick={() => handleThemeChange('sad')}>Sad Theme</button>
        <button className="theme-button" onClick={() => handleThemeChange('summer')}>Summer Theme</button>
        <button className="theme-button" onClick={() => handleThemeChange('vibrant')}>Vibrant Theme</button>
        </div>
        <button className="toggle-background-button" onClick={toggleBackground}>
          {isBackgroundEnabled ? 'Remove Background' : 'Add Background'}
        </button>
      </div>
      <div className={`editor-container ${isBackgroundEnabled ? 'background-enabled' : ''}`} style={theme}>
        <div className="user-inputs">
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter your email..."
            className="email-input"
          />
          <div className="avatar-options">
            {avatarOptions.map((avatar, index) => (
              <img
                key={index}
                src={avatar.url}
                alt={avatar.name}
                className="avatar"
                onClick={() => handleAvatarSelect(avatar)}
              />
            ))}
            {avatarSelectedMessage && <p className="avatar-selected-message">{avatarSelectedMessage}</p>}
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => SetSearchTerm(e.target.value)}
            placeholder="Search messages..."
            className="search-input"
          />
        </div>
  
        <div className="messages-container">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message, index) => (
              <div key={index} className="message">
                <div className="reactions">
                  {message.reactions.map((reaction, reactionIndex) => (
                    <span
                      key={reactionIndex}
                      className="reaction"
                      onClick={() => handleReactionClick(index, reaction.id || 0)}
                    >
                      {reaction.emoji} {reaction.count}
                    </span>
                  ))}
                </div>
                <div className="user-info">
                  <img
                    src={message.avatar || undefined}
                    alt="User Avatar"
                    className="avatar"
                    onClick={() => handleAvatarClick(index)}
                  />
                  <strong className="username">{message.user}:</strong>
                </div>
                {showReactionOptions && (
                  <div className="reaction-options">
                    <button onClick={() => handleReactionOptionClick('👍')}>👍</button>
                    <button onClick={() => handleReactionOptionClick('❤️')}>❤️</button>
                    <button onClick={() => handleReactionOptionClick('👎')}>👎</button>
                    <button onClick={() => handleReactionOptionClick('😂')}>😂</button>
                  </div>
                )}
                <div className="message-text">
                  <span style={getMessageStyle(message.text)}>{message.text}</span>
                  <button onClick={() => handleEditMessage(index)}>Edit</button>
                  <button onClick={() => handleDeleteMessage(index)}>Delete</button>
                  <button onClick={() => handlePinMessage(index)}>
                    {message.pinned ? 'Unpin' : 'Pin'}
                  </button>
                </div>
                <div className="extra-info">
                  <span className="avatar-name">{message.avatarName}</span>
                  <span className="timestamp">{new Date(message.timestamp).toLocaleString()}</span>
                  {message.files && message.files.length > 0 && (
                    <div className="attachments">
                      <strong>Attachments:</strong>
                      <ul className="file-list">
                        {message.files.map((file, fileIndex) => (
                          <li key={fileIndex}>
                            <a href={fileURLs[file.name]} download={file.name}>{file.name}</a>
                            <button onClick={() => handleFileDelete(file.name)}>Delete</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>No messages found.</div>
          )}
          {isTyping && <div className="typing">{userEmail} is typing...</div>}
        </div>
  
        <div className="message-input-two">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping(true);
            }}
            placeholder="Type your message..."
            className="new-message-input"
          />
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="file-input"
          />
           {deleteMessage && <div className="delete-message">{deleteMessage}</div>}
          <div className="emoji-picker">
          <EmojiPicker onSelect={handleEmojiSelect}/>
          </div>
          <button onClick={() => toggleFormatting('bold')}><b>B</b></button>
          <button onClick={() => toggleFormatting('italic')}><i>I</i></button>
          <button onClick={() => toggleFormatting('underline')}><u>U</u></button>
          <button onClick={handleSendMessage}>Send</button><AuthComponent />
        </div>
      </div>
      </div>
  );
};

export default Chat;

interface Message {
  text: string;
  timestamp: number;
  user: string;
  avatar: string | null;
  avatarName: string | null; // Allow null for avatarName
  reactions: Reaction[];
  files: File[];
  pinned: boolean;
}


interface Reaction {
  id?: number;
  emoji: string;
  count: number;
}
