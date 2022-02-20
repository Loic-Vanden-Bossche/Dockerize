import {configureStore} from '@reduxjs/toolkit';
import {setupListeners} from "@reduxjs/toolkit/query";
import {booksApi} from "./api/books";

export const store = configureStore({
    reducer: {
        [booksApi.reducerPath]: booksApi.reducer,
    },

    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(booksApi.middleware)
})

setupListeners(store.dispatch)