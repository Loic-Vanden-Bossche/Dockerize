export interface Book{
    isbn : string,
    title : string,
    author : string,
    overview : string,
    picture : string,
    read_count : number,
}

export interface ReadCountModification{
    isbn : string,
    read_count : number
}