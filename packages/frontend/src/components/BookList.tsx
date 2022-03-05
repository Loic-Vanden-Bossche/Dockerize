import ListCell from "./ListCell";
import "../style/BookList.scss";
import { useGetRegisteredBooksQuery } from "../store/api/books";
import {Book} from "../lib/Types";

const BookList = () => {
    const { data, error, isLoading } = useGetRegisteredBooksQuery();

    if (isLoading){
        return(
            <div className="loading">
                <div className="lds-ring">
                    <div> </div>
                    <div> </div>
                    <div> </div>
                    <div> </div>
                </div>
                <p>Loading books</p>
            </div>
        );
    }
    else if (!error && !data){
        return(
            <p>Error !</p>
        );
    }
    else {
        return(
            <ul className="BookList">
                {data?.map((item: Book) => {
                    return (
                        <ListCell key={item.isbn} book={item}/>
                    );
                })}
            </ul>
        );
    }
};

export default BookList;