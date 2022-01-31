import { useState } from 'react';
import './App.css';
import AddBook from './components/AddBook';
import BookList from './components/BookList';

function App() {
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  
  return (
    <html>
      <button onClick={ () => setShowAddBookModal(true) }>
        Add new book
      </button>
      <AddBook show={showAddBookModal} disable={() => {setShowAddBookModal(false)} }/>
      <BookList/>
    </html>
  );
}

export default App;
