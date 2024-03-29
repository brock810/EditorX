// App.tsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import CodeEditor from './CodeEditor';
import Chat from './Chat';
import HomePage from './HomePage'; 
import AboutPage from './AboutPage';
import ContactUsPage from './ContactUsPage'; 
import store from '../redux/store';
import './CodeEditorStyles.css'; 

const App: React.FC = () => {
  return (
    <Provider store={store}>
        <div className="app-container">
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contactus" element={<ContactUsPage />} />
            </Routes>
          </main>
        
        </div>
    </Provider>
  );
};

const EditorPage: React.FC = () => {
  return (
    <>
      <CodeEditor />
      <Chat />
    </>
  );
};

export default App;
