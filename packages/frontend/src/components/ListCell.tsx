import { IBook } from "../lib/Types";

const ListCell = (prop: {book: IBook, isbn: string}) => {
    return (
        <li className="ListCell">
            <img src={`https://images.isbndb.com/covers/53/15/${prop.isbn}.jpg`} alt='mon bon chibron' width='105' height='160'/>
            <h2>{prop.book.title}</h2>
            <h3>{prop.book.author}</h3>
            <p>{prop.book.overview}</p>
            <h4>read {prop.book.read_count} times</h4>
        </li>
    );
}

export default ListCell;