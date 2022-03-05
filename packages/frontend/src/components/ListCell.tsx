import { Book } from "../lib/Types";
import { useDeleteBookMutation } from "../store/api/books";

const ListCell = (prop: {book: Book}) => {
    const  [delBook] = useDeleteBookMutation();
    return (
        <li className="ListCell">
            <div className="preview">
                <div className="image">
                    <div className="slice">
                        <img src={prop.book.picture} alt={prop.book.title}/>
                    </div>
                    <img src={prop.book.picture} alt={prop.book.title}/>
                    <div className="shadow"/>
                </div>
                <div className="description">
                    <h2>{prop.book.title}</h2>
                    <h4>{prop.book.author}</h4>
                    <button onClick={() => delBook(prop.book.isbn) }><img src="trash.svg" width="15px" height="20px"></img></button>
                </div>
            </div>
        </li>
    );
}

export default ListCell;