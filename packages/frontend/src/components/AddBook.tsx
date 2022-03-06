import { useState } from "react";
import "../style/AddBook.scss";
import {useGetBooksWithSimilarNameQuery, usePostNewBookMutation} from "../store/api/books";
import {Book} from "../lib/Types";

const AddBook = (prop:{show:Boolean, disable:() => void}) => {
    const [Title, setTitle] = useState("")
    const { data } = useGetBooksWithSimilarNameQuery(Title);
    const [addBook] = usePostNewBookMutation();

    if(prop.show){
        const handleSubmit = (book:Book) => {
            addBook(book);
            prop.disable()
        }

        return (
            <div className="AddBook">
                <div className="Modal">
                    <div className="Header">
                        <h2>Add a book</h2>
                        <button onClick={() => prop.disable()} className='cross'>
                            <div className='left'> </div>
                            <div className='right'> </div>
                        </button>
                    </div>
                    <input type="text" onChange={e => setTitle(e.target.value)} placeholder="Enter a book name"/>
                    <ul>
                        {data?.map((item: Book) => {
                            return (
                                <li>
                                    <img src={item.picture} alt={item.title}/>
                                    <p><b>{item.title},</b> by {item.author}</p>
                                    <button onClick={() => handleSubmit(item)}>Select</button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    }else{
        return null
    }
};

export default AddBook