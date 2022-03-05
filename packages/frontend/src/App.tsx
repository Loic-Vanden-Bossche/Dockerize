import BookList from './components/BookList';
import './style/App.scss';
import AddBook from "./components/AddBook";
import {useState} from "react";
import BookInformation from "./components/BookInformation";
import {Book} from "./lib/Types";

function App() {
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBookInformationModal, setShowBookInformationModal] = useState(false);
  const [bookToShow, setBookToShow] = useState<Book|null>(null);

  const handleBookInformation = (book:Book) => {
      setShowBookInformationModal(true);
      setBookToShow(book);
  }

  return (
      <html>
          <AddBook show={showAddBookModal} disable={() => setShowAddBookModal(false)}/>
          <BookInformation show={showBookInformationModal} disable={() => setShowBookInformationModal(false)} book={bookToShow}/>

          <button onClick={() => setShowAddBookModal(true)} className="addBook_Button">Add Book</button>

          <BookList openBook={handleBookInformation}/>
      </html>
  );
}

export default App;
