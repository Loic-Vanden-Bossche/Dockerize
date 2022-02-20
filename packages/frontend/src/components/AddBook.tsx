import { useState } from "react";
import "../style/AddBook.scss";

const AddBook = (prop:{show:Boolean, disable:() => void}) => {
    const [Title, setTitle] = useState("")

    if(prop.show){
        const handleSubmit = () => {
            console.log(Title)

            prop.disable()
        }
        return (
            <div className="AddBook">
                <div className="Modal">
                    <div className="Header">
                        <h2>Add a book</h2>
                        <button onClick={ handleSubmit } className='cross'>
                            <div className='left'> </div>
                            <div className='right'> </div>
                        </button>
                    </div>
                    <input type="text" onChange={e => setTitle(e.target.value)} placeholder="Enter a book name"/>
                    <ul>
                        <li>oui</li>
                        <li>oui</li>
                        <li>oui</li>
                    </ul>
                </div>
            </div>
        );
    }else{
        return null
    }
};

export default AddBook