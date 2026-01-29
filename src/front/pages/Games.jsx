import React, { useEffect, useState, useRef, useCallback } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { RawgGameCard } from "../components/RawgGameCard.jsx";
import projectimage1 from "../assets/img/projectimage1.png";

export const Games = () => {
  const { store } = useGlobalReducer();
  const [games, setGames] = useState([]);
  const [gamesWithDescriptions, setGamesWithDescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const observer = useRef();

  const fetchGames = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.rawg.io/api/games?key=e09cf7c5817241ee825687b3373f921f&page=${pageNum}&page_size=20`
      );
      const data = await res.json();
      if (data.results?.length) {
        setGames((prev) =>
          pageNum === 1 ? data.results : [...prev, ...data.results]
        );
        setHasMore(!!data.next);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  const enrichGamesWithDescriptions = async (gamesToEnrich) => {
    return await Promise.all(
      gamesToEnrich.map(async (game) => {
        try {
          const res = await fetch(
            `https://api.rawg.io/api/games/${game.slug}?key=e09cf7c5817241ee825687b3373f921f`
          );
          const details = await res.json();
          return { ...game, description: details.description_raw || "" };
        } catch {
          return { ...game, description: "" };
        }
      })
    );
  };

  useEffect(() => {
    if (searchTerm.length === 0) {
      fetchGames(page);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    if (searchTerm.length === 0 && games.length) {
      const newGames = games.filter(
        (game) => !gamesWithDescriptions.some((g) => g.id === game.id)
      );
      if (newGames.length === 0) return;

      enrichGamesWithDescriptions(newGames).then((enriched) => {
        setGamesWithDescriptions((prev) =>
          page === 1 ? enriched : [...prev, ...enriched]
        );
      });
    } else if (searchTerm.length > 0) {
      setGamesWithDescriptions([]);
    }
  }, [games, searchTerm, page]);

  const fetchSearchedGames = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.rawg.io/api/games?key=e09cf7c5817241ee825687b3373f921f&search=${query}&page_size=20`
      );
      const data = await res.json();
      if (data.results?.length) {
        const enriched = await enrichGamesWithDescriptions(data.results);
        setGamesWithDescriptions(enriched);
        setHasMore(false);
      } else {
        setGamesWithDescriptions([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 2) {
        fetchSearchedGames(searchTerm);
      } else {
        setGames([]);
        setGamesWithDescriptions([]);
        setHasMore(true);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const lastGameRef = useCallback(
    (node) => {
      if (loading || searchTerm.length > 0) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, searchTerm]
  );

  return (
    <div
      className="text-center container-fluid"
      style={{
        position: "relative",
        backgroundImage: `url(${projectimage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "4rem",
      }}
    >
<div
  style={{
    position: "relative",
    marginBottom: "2rem",
    maxWidth: "1200px",
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    padding: "0 1rem",
  }}
>
  <h1
    className="text-white"
    style={{
      fontWeight: "600",
      fontSize: "2.5rem",
      margin: 0,
      textAlign: "center",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    A Selection of Modern Games
  </h1>

  <input
    type="text"
    placeholder="Search games..."
    className="form-control"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      position: "absolute",
      top: "50%",
      right: "-275px",
      transform: "translateY(-50%)",
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


      <div className="row w-100 px-3 px-md-5">
        {gamesWithDescriptions.map((rawgGame, index) => {
          const isLast = index === gamesWithDescriptions.length - 1;
          return (
            <div
              key={rawgGame.id}
              className="col-6 col-md-4 col-lg-3 mb-4"
              ref={isLast ? lastGameRef : null}
            >
              <RawgGameCard
                name={rawgGame.name}
                slug={rawgGame.slug}
                img={rawgGame.background_image}
                uid={rawgGame.id}
              />
            </div>
          );
        })}
      </div>

      {loading && <p className="text-white mt-3">Loading more games...</p>}
      {!hasMore && !loading && (
        <p className="text-white mt-3">No more games to load.</p>
      )}
    </div>
  );
};
