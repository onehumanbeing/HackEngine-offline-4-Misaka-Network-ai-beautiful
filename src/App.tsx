import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { GlobalContextProvider } from './components/GlobalContext';
import { ChatBox } from './components/ChatBox';
import { MainStage } from './components/MainStage';
import { loadModel } from './utils/model';

loadModel()

function App() {
  return (
    <GlobalContextProvider>
      <div className="App">
        <ChatBox />
        <MainStage />
      </div>
    </GlobalContextProvider>
  );
}

export default App;
