import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {Book} from "../../lib/Types";

export const booksApi = createApi({
    reducerPath: 'booksApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:4000/'
    }),
    tagTypes: ['Get', 'POST', 'DELETE', 'PUT'],
    endpoints: builder => ({
        getBooks: builder.query<Book[], void>({
            query: () => 'books/',
            providesTags: (result, error, id) => [{type:'Get', skip: true, id:'getBooks'}],
            transformResponse: (response: { data: Book[] }, meta, arg) => response.data,
        }),
    }),
})

export const { useGetBooksQuery } = booksApi