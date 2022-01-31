import { IBook } from "../lib/Types";
import "./ListCell.css"

const ListCell = (prop: {book: IBook, isbn: string}) => {
    return (
        <li className="ListCell">
            <div className="preview">
                <img src={`https://images.isbndb.com/covers/53/15/${prop.isbn}.jpg`} alt='mon bon chibron' />
                <div>
                    <h2>{prop.book.title}</h2>
                    <h4>{prop.book.author}</h4>
                    <h3>read {prop.book.read_count} times</h3>
                </div>
            </div>
            <p>{prop.book.overview}</p>
        </li>
    );
}

export default ListCell;