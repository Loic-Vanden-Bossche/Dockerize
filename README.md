# Dockerize

Dockerize is a school project that is a web application offering a reader to save books
that he has read during his life, in his virtual library.

The goal of this project is to learn how to use development tools such as [Github](https://github.com/) and [Docker](https://www.docker.com/)

## Installation

At the root of the project you can use the command :

```
npm install -g pnpm

pnpm install

npm start
```

to launch the Docker containers


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

The application back is based on [NestJS](https://nestjs.com/)

## Usage

## Testing

## Caveat

The Hot Reloading is not working for now with docker for the front-end

## Contributing


## License

Copyright (c) Loïc Vanden-Bossche, Mathieu Ferreira, Enzo Soares, Quentin Coqueran. All rights reserved.

