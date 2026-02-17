import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import projectimage1 from "../../img/projectimage1.png";
import { Carousel } from "../components/Carousel.jsx";
import { Link } from "react-router-dom";
import { RawgGameCarousel } from "../components/RawgGameCarousel.jsx";

export const Home = () => {
  const { store, dispatch, getVintageGames, getRawgGames } = useGlobalReducer();
  const [retroGames, setRetroGames] = useState([]);
  const [newGames, setNewGames] = useState([]);

  useEffect(() => {
    if (store.vintageGames.length === 0) {
      getVintageGames(dispatch);
    }
    if (!store.rawgGames || store.rawgGames.length === 0) {
      getRawgGames(dispatch);
    }
  }, []);

  useEffect(() => {
    setRetroGames(store.vintageGames);
    setNewGames(store.rawgGames || []);
  }, [store.vintageGames, store.rawgGames]);

  return (
    <div
      className="home"
      style={{
        backgroundImage: `url(${projectimage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100%",
        paddingBottom: "2rem",
      }}
    >
      <div
        className="text-white text-center px-4 py-5"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <h1 className="display-4">Welcome to Ominisient</h1>
        <p className="lead mt-3">
          Step into a world where the classics meet the cutting edge. At{" "}
          <strong>Ominisient</strong>, you can browse a curated collection of
          <em> modern hits</em> and <em>vintage gems</em> — all in one place.
          Whether you're reliving pixelated nostalgia or discovering the latest
          blockbusters, we’ve got something for every gamer!
        </p>
      </div>

      <div className="text-center mt-5">
        <Link to={"/retrogames"} className="text-decoration-none text-white">
        <h2> Retro Games</h2>
        </Link>
      </div>
      <div className="px-3">
        {retroGames?.length > 0 && (
          <Carousel
            games={retroGames.map((game) => ({
              uid: game.id,
              name: game.name,
              img: game.cover?.url ?? "",
            }))}
          />
        )}
      </div>

      <div className="text-center mt-5">
        <Link to={"/games"} className="text-decoration-none text-white">
        <h2>Modern Games</h2>
        </Link>
      </div>
      <div className="px-3">
        {newGames?.length > 0 && (
          <RawgGameCarousel
            games={newGames.map((game) => ({
              uid: game.id,
              name: game.name,
              img: game.background_image,
            }))}
          />
        )}
      </div>
    </div>
  );
};
