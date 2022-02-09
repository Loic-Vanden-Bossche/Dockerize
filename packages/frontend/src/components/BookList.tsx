import ListCell from "./ListCell";
import { IBookList } from "../lib/Types";
import "../style/BookList.scss";

const BookList = () => {
    const books:IBookList = {
        '9782723442275' : {
            title : 'Bleach, Tome 1',
            author : 'Tite Kubo',
            overview : "Adolescent de quinze ans, Ichigo Kurosaki possède un don particulier : celui de voir les esprits. Un jour, il croise la route d'une belle shinigami (un être spirituel) en train de pourchasser une “âme perdue”, un esprit maléfique qui hante notre monde et n'arrive pas à trouver le repos. Mise en difficulté par son ennemi, la jeune fille décide alors de prêter une partie de ses pouvoirs à Ichigo, mais ce dernier hérite finalement de toute la puissance du shinigami. Contraint d'assumer son nouveau statut, Ichigo va devoir gérer ses deux vies : celle de lycéen ordinaire, et celle de chasseur de démons... Manga d'action au rythme trépidant, au graphisme soigné et à l'intrigue palpitante, Bleach vous guidera dans les méandres des shinigami, pour une intrigue entre la Terre et l'Au-delà.",
            picture : '9782505005315.jpg',
            read_count : 3,
        },
        '9782505005315' : {
            title : 'Blue Dragon - Ral Grad - Tome 1',
            author : 'Tsugumi Ohba',
            overview : "L'humanité est menacée ! Un shonen dévastateur en 4 volumes ! Les Kages sont des ombres maléfiques et monstrueuses qui s'attaquent aux hommes. Une seule personne peut les vaincre : Ral ! Avec l'aide de Grad, le terrible blue dragon qui vit en lui, Ral parviendra-t-il à sauver le monde ?!",
            picture : '9782505005315.jpg',
            read_count : 23,
        },
        '9782723342275' : {
            title : 'Bleach, Tome 1',
            author : 'Tite Kubo',
            overview : "Adolescent de quinze ans, Ichigo Kurosaki possède un don particulier : celui de voir les esprits. Un jour, il croise la route d'une belle shinigami (un être spirituel) en train de pourchasser une “âme perdue”, un esprit maléfique qui hante notre monde et n'arrive pas à trouver le repos. Mise en difficulté par son ennemi, la jeune fille décide alors de prêter une partie de ses pouvoirs à Ichigo, mais ce dernier hérite finalement de toute la puissance du shinigami. Contraint d'assumer son nouveau statut, Ichigo va devoir gérer ses deux vies : celle de lycéen ordinaire, et celle de chasseur de démons... Manga d'action au rythme trépidant, au graphisme soigné et à l'intrigue palpitante, Bleach vous guidera dans les méandres des shinigami, pour une intrigue entre la Terre et l'Au-delà.",
            picture : '9782505005315.jpg',
            read_count : 3,
        },
        '9782505705315' : {
            title : 'Blue Dragon - Ral Grad - Tome 1',
            author : 'Tsugumi Ohba',
            overview : "L'humanité est menacée ! Un shonen dévastateur en 4 volumes ! Les Kages sont des ombres maléfiques et monstrueuses qui s'attaquent aux hommes. Une seule personne peut les vaincre : Ral ! Avec l'aide de Grad, le terrible blue dragon qui vit en lui, Ral parviendra-t-il à sauver le monde ?!",
            picture : '9782505005315.jpg',
            read_count : 23,
        },
        '9782728942275' : {
            title : 'Bleach, Tome 1',
            author : 'Tite Kubo',
            overview : "Adolescent de quinze ans, Ichigo Kurosaki possède un don particulier : celui de voir les esprits. Un jour, il croise la route d'une belle shinigami (un être spirituel) en train de pourchasser une “âme perdue”, un esprit maléfique qui hante notre monde et n'arrive pas à trouver le repos. Mise en difficulté par son ennemi, la jeune fille décide alors de prêter une partie de ses pouvoirs à Ichigo, mais ce dernier hérite finalement de toute la puissance du shinigami. Contraint d'assumer son nouveau statut, Ichigo va devoir gérer ses deux vies : celle de lycéen ordinaire, et celle de chasseur de démons... Manga d'action au rythme trépidant, au graphisme soigné et à l'intrigue palpitante, Bleach vous guidera dans les méandres des shinigami, pour une intrigue entre la Terre et l'Au-delà.",
            picture : '9782723442275.jpg',
            read_count : 3,
        },
        '9782505005345' : {
            title : 'Blue Dragon - Ral Grad - Tome 1',
            author : 'Tsugumi Ohba',
            overview : "L'humanité est menacée ! Un shonen dévastateur en 4 volumes ! Les Kages sont des ombres maléfiques et monstrueuses qui s'attaquent aux hommes. Une seule personne peut les vaincre : Ral ! Avec l'aide de Grad, le terrible blue dragon qui vit en lui, Ral parviendra-t-il à sauver le monde ?!",
            picture : '9782505005315.jpg',
            read_count : 23,
        },
    }
    return(
        <ul className="BookList">
            {Object.keys(books).map((item: string) => {
                return (
                    <ListCell key={item} book={books[item]} isbn={item}/>
                );
            })}
        </ul>
    );
};

export default BookList;