// File: src/App.tsx

import React from 'react';
import GridSelection from './GridSelection';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Grid Selection Demo</h1>
      <GridSelection rows={12} columns={12} />
    </div>
  );
};

export default App;
