import { Book } from "../lib/Types";
import {useChangeBookReadTimeMutation, useDeleteBookMutation} from "../store/api/books";

const ListCell = (prop: {book: Book, onClick: (book: Book) => void}) => {
    const [changeReadCount] = useChangeBookReadTimeMutation();
    const  [delBook] = useDeleteBookMutation();

    const handleReadCountIncrease = () => {
        if(prop.book){
            changeReadCount({
                isbn: prop.book.isbn,
                read_count: prop.book.read_count + 1
            });
        }
    }

    const handleReadCountDecrease = () => {
        if(prop.book){
            changeReadCount({
                isbn: prop.book.isbn,
                read_count: prop.book.read_count - 1
            });
        }
    }

    return (
        <li className="ListCell">
            <div className="preview">
                <div className="image" onClick={() => prop.onClick(prop.book)}>
                    <div className="slice">
                        <img src={prop.book.picture} alt={prop.book.title}/>
                    </div>
                    <img src={prop.book.picture} alt={prop.book.title}/>
                    <div className="shadow"/>
                </div>
                <div className="description">
                    <h2>{prop.book.title}</h2>
                    <h4>{prop.book.author}</h4>
                    <h5>
                        <button onClick={handleReadCountIncrease}>+</button>
                        Read {prop.book.read_count} times
                        <button disabled={prop.book.read_count <= 1} onClick={handleReadCountDecrease}>-</button>
                    </h5>
                    <button onClick={() => delBook(prop.book.isbn) }><img src="trash.svg" width="15px" height="20px" alt="delete"></img></button>
                </div>
            </div>
        </li>
    );
}

export default ListCell;
