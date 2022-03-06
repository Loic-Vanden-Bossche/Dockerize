# Dockerize

Dockerize is a school project that is a web application offering a reader to save books
that he has read during his life, in his virtual library.

The goal of this project is to learn how to use development tools such as [Github](https://github.com/) and [Docker](https://www.docker.com/)

## Deployment

At the root of the project you can use these commands :

To start containers:
```
npm start
```

To install modules locally:
```
npm install -g pnpm
pnpm install
```

## GitHub Actions

The project has a CI system managed by GitHub actions.

It run the following actions:
- `back-build`: build the back-end
- `front-build`: build the front-end
- `back-tests`: run the tests on the back-end
- `back-tests-e2e`: run the end-to-end tests on the back-end

## Front-End

The application front is based on [React](https://reactjs.org/) with typescript langage. 

To manage the state of our front application we are using [React-Redux](https://react-redux.js.org/).
For all the api request we are using RTK Query which is a part of [Redux Toolkit](https://redux-toolkit.js.org/).

### Style

To make all the styling of our application we are using a CSS framework called [SASS](https://sass-lang.com/).
The font of our application is [Merriweather](https://fonts.google.com/specimen/Merriweather) 
and all the icons used comes from [Font Awesome](https://fontawesome.com/icons).

### Requested Features

All the base features requested in the "Sujet proposé #2 : Application web" have been added.
In the home screen all books from library are displayed with :

 - Book name
 - Book cover
 - Author name
 - Read count (adjustable with + and - cursors)
 - A delete button

At the top left of the screen there is an "Add book" button and if you click on it a modal appear.
If you write a book name in the search bar the modal will list books with similar name. 
If you click on a select button the following book will be added to your library.

If you click on one of the library book it display all the following information in a modal:

- Book name
- Book cover
- Author name
- Book overview

## Back-end

The application back is based on [NestJS](https://nestjs.com/) with typescript language. 

All the base features requested in the "Sujet proposé #1 : API Rest" have been added.

We have users, an authentication system, book management.
We also have roles for users. 

For list queries we implemented a pagination system.

Schema validation is implemented with [Joi](https://www.npmjs.com/package/joi) for all endpoints and entities.

For the book search system we query the [openlibrary](https://openlibrary.org/) REST API.\

The added books are stored in the database with data from the API [openlibrary](https://openlibrary.org/). 

## Testing

There is 89 e2e tests for backend.
For users, auth and books.

To run the tests locally you can use the following command :
```
npm run test:e2e
```

## Caveat

The Hot Reloading is not working for now with docker for the front-end

Modules are installed at containers build. Node module from host and containers are totally separated.

## License

Copyright (c) Loïc Vanden-Bossche, Mathieu Ferreira, Enzo Soares, Quentin Coqueran. All rights reserved.

