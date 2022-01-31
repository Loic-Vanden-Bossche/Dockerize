import { useState } from "react";
import "./AddBook.css"

const AddBook = (prop:{show:Boolean, disable:() => void}) => {
    const [Isbn, setIsbn] = useState("")
    const [Title, setTitle] = useState("")
    const [Author, setAuthor] = useState("")
    const [Overview, setOverview] = useState("")
    const [ReadCount, setReadCount] = useState(0)


    if(prop.show){
        const handleSubmit = () => {
            console.log(Isbn)
            console.log(Title)
            console.log(Author)
            console.log(Overview)
            console.log(ReadCount)

            prop.disable()
        }
        return (
            <div className="AddBook">
                <div>
                    <h2>Add a book</h2>
                    <form>
                        <label>ISBN :<br/><input type="text" onChange={(e) => setIsbn(e.target.value)}/></label>
                        <label>Title :<br/><input type="text" onChange={(e) => setTitle(e.target.value)}/></label>
                        <label>Author :<br/><input type="text" onChange={(e) => setAuthor(e.target.value)}/></label>
                        <label>Read Count :<br/><input type="number"/></label>
                        <label>Picture :<br/><input type="file"/></label>
                        <label>Overview :<br/><input type="text" onChange={(e) => setOverview(e.target.value)}/></label>
                    </form>
                    <button onClick={ handleSubmit }>Validate</button>
                </div>
            </div>
        );
    }else{
        return null
    }
};

export default AddBook