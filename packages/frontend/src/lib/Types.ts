export interface IBook{
    title : string,
    author : string,
    overview : string,
    picture : string,
    read_count : number,
}

export interface IBookList{
    [isbn: string]: IBook
}
