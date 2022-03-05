import BookList from './components/BookList';
import './style/App.scss';
import AddBook from "./components/AddBook";
import {useState} from "react";

function App() {
  const [showModal, setShowModal] = useState(false);
  return (
      <html>
          <AddBook show={showModal} disable={() => setShowModal(false)}/>
          <button onClick={() => setShowModal(true)} className="addBook_Button">Add Book</button>
          <BookList/>
      </html>
  );
}

export default App;
