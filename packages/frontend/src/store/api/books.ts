import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {Book} from "../../lib/Types";

export const booksApi = createApi({
    reducerPath: 'booksApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:4000/'
    }),
    tagTypes: ['GET', 'POST', 'DELETE', 'PUT'],
    endpoints: builder => ({
        getRegisteredBooks: builder.query<Book[], void>({
            query: () => 'books/',
            providesTags: (result, error, id) => [{type:'GET', skip: true, id:'getRegisteredBooks'}],
            transformResponse: (response: { data: Book[] }, meta, arg) => response.data,
        }),
        getBooksWithSimilarName: builder.query<Book[], string>({
            query: (name) => ({url:`books/search/${name}`}),
            providesTags: (result, error, id) => [{type:'GET', skip: true, id:'getBooksWithSimilarName'}],
        }),
        postNewBook: builder.mutation<Book[], Book>({
            query: (bookData) => ({
                url:`books/`,
                method:'POST',
                body: bookData
            }),
            invalidatesTags: [{type:'GET', id:'getRegisteredBooks'}],
        }),
    }),
})

export const { useGetRegisteredBooksQuery, useGetBooksWithSimilarNameQuery, usePostNewBookMutation } = booksApi