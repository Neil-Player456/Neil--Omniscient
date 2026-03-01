import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { GameCard } from "../components/GameCard.jsx";
import projectimage1 from "../../img/projectimage1.png";

export const RetroGames = () => {
  const { store, getVintageGames } = useGlobalReducer();
  const [retroGames, setRetroGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (store.vintageGames.length === 0) {
      getVintageGames();
    }
  }, []);

  useEffect(() => {
    setRetroGames(store.vintageGames);
  }, [store.vintageGames]);

  const filteredGames = retroGames.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCoverUrl = (game) => {
    if (!game.cover?.url) return "";
    return game.cover.url.startsWith("http")
      ? game.cover.url.replace("t_thumb", "t_cover_big")
      : `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`;
  };

  return (
    <div
      className="text-center container-fluid"
      style={{
        backgroundImage: `url(${projectimage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        minHeight: "100vh",
      }}
    >
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          minHeight: "120px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h1
          className="text-white w-100"
          style={{
            textAlign: "center",
            margin: 0,
            fontWeight: "bold",
          }}
        >
          A Wide Selection of Retro Games
        </h1>

        <input
          type="text"
          placeholder="Search retro games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="position-absolute"
          style={{
            top: "20px",
            right: "20px",
            width: "250px",
            minWidth: "150px",
            padding: "0.4rem 0.75rem",
            borderRadius: "20px",
            border: "1px solid #ddd",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            fontSize: "1rem",
            outline: "none",
          }}
        />
      </div>

      <div className="row px-3">
        {filteredGames.length > 0 ? (
          filteredGames.map((vintageGames, index) => (
            <div key={index} className="col-6 col-md-4 col-lg-3 mb-4">
              <GameCard
                type={"vintageGames"}
                name={vintageGames.name}
                uid={vintageGames.id}
                img={getCoverUrl(vintageGames)}
                summary={vintageGames.summary}
              />
            </div>
          ))
        ) : (
          <p className="text-white">No retro games found.</p>
        )}
      </div>
    </div>
  );
};