import { useState } from "react";

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
            <div>
                <h2>Add a book</h2>
                <form>
                    <label>ISBN<input type="text" onChange={(e) => setIsbn(e.target.value)}/></label>
                    <label>Title<input type="text" onChange={(e) => setTitle(e.target.value)}/></label>
                    <label>Author<input type="text" onChange={(e) => setAuthor(e.target.value)}/></label>
                    <label>Overview<input type="text" onChange={(e) => setOverview(e.target.value)}/></label>
                    <label>Picture<input type="file"/></label>
                    <label>Read Count<input type="number"/></label>
                </form>
                <button onClick={ handleSubmit }>Validate</button>
            </div>
        );
    }else{
        return null
    }
};

export default AddBook