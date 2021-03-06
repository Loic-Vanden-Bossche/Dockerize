import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {Book, ReadCountModification} from "../../lib/Types";

export const booksApi = createApi({
    reducerPath: 'booksApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:4000/'
    }),
    tagTypes: ['GET', 'POST', 'DELETE', 'PUT'],
    endpoints: builder => ({
        getRegisteredBooks: builder.query<Book[], void>({
            query: () => 'books/',
            providesTags: () => [{type:'GET', skip: true, id:'getRegisteredBooks'}],
            transformResponse: (response: { data: Book[] }) => response.data,
        }),

        getBooksWithSimilarName: builder.query<Book[], string>({
            query: (name) => ({url:`books/search/${name}`}),
            providesTags: () => [{type:'GET', skip: true, id:'getBooksWithSimilarName'}],
        }),

        postNewBook: builder.mutation<Book, Book>({
            query: (bookData) => ({
                url:`books/`,
                method:'POST',
                body: bookData
            }),
            invalidatesTags: [{type:'GET', id:'getRegisteredBooks'}],
        }),

        deleteBook: builder.mutation<Book, string>({
            query: (isbn) => ({
                url:`books/${isbn}`,
                method:'DELETE',
            }),
            invalidatesTags: [{type:'GET', id:'getRegisteredBooks'}],
        }),

        changeBookReadTime: builder.mutation<Book, ReadCountModification>({
            query: (modifications) => ({
                url:`books/${modifications.isbn}`,
                method:'PUT',
                body: { read_count: modifications.read_count }
            }),
            invalidatesTags: [{type:'GET', id:'getRegisteredBooks'}],
        }),
    }),
})

export const {
    useGetRegisteredBooksQuery,
    useGetBooksWithSimilarNameQuery,
    usePostNewBookMutation,
    useDeleteBookMutation,
    useChangeBookReadTimeMutation
} = booksApi
