import "../style/AddBook.scss";
import {Book} from "../lib/Types";
import "../style/BookInformation.scss"
import {useChangeBookReadTimeMutation} from "../store/api/books";

const BookInformation = (prop:{show:Boolean, disable:() => void, book: Book|null}) => {

    if(prop.show && prop.book){

        return (
            <div className="BookInformation">
                <div className="Modal">
                    <div className="Head">
                        <img src={prop.book.picture} alt="Cover"/>
                        <div>
                            <h2>{prop.book.title}, by {prop.book.author}</h2>
                            <h3>Read {prop.book.read_count} times</h3>
                        </div>
                        <button onClick={() => prop.disable()}>X</button>
                    </div>
                    <p>{prop.book.overview}</p>
                </div>
            </div>
        );
    }else{
        return null
    }
};

export default BookInformation