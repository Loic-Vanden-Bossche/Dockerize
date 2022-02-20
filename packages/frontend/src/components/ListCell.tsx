import { Book } from "../lib/Types";

const ListCell = (prop: {book: Book}) => {
    return (
        <li className="ListCell">
            <div className="preview">
                <div className="image">
                    <div className="slice">
                        <img src={`https://images.isbndb.com/covers/53/15/${prop.book.isbn}.jpg`} alt={prop.book.title}/>
                    </div>
                    <img src={`https://images.isbndb.com/covers/53/15/${prop.book.isbn}.jpg`} alt={prop.book.title}/>
                    <div className="shadow"/>
                </div>
                <div className="description">
                    <h2>{prop.book.title}</h2>
                    <h4>{prop.book.author}</h4>
                </div>
            </div>
        </li>
    );
}

export default ListCell;