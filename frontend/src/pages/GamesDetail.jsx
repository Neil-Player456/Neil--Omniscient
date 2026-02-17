import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import projectimage1 from "../../img/projectimage1.png";

export const GameDetails = () => {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get normalized backend URL
  const getBackendUrl = () => {
    let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001/api';
    // Ensure backendUrl ends with /api
    if (!backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.endsWith('/') ? `${backendUrl}api` : `${backendUrl}/api`;
    }
    return backendUrl;
  };

  useEffect(() => {
    const fetchGameDetailsAndVideos = async () => {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(
          `${backendUrl}/rawg/games/${slug}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const gameData = await res.json();
        setGame(gameData);

        if (gameData.id) {
          const screenshotsRes = await fetch(
            `${backendUrl}/rawg/games/${gameData.id}/screenshots`
          );
          if (!screenshotsRes.ok) {
            throw new Error(`HTTP error! status: ${screenshotsRes.status}`);
          }
          const screenshotsData = await screenshotsRes.json();
          setScreenshots(screenshotsData.results || []);
        }
      } catch (error) {
        console.error("Error fetching game details or videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetailsAndVideos();
  }, [slug]);

  if (loading) return <div className="text-white text-center mt-5">Loading...</div>;
  if (!game) return <div className="text-white text-center mt-5">Game not found.</div>;

  const backgroundBox = {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginBottom: "1.2rem",
    color: "#eee",
  };

  return (
    <div
      className="main"
      style={{
        backgroundImage: `url(${projectimage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100vw",
        paddingTop: "2rem",
      }}
    >
      <div className="p-4 text-white container" style={{ maxWidth: 900 }}>
        <div style={backgroundBox}>
          <h1 className="mb-3 text-center">{game.name}</h1>
        </div>

        <img
          src={game.background_image}
          alt={game.name}
          style={{ maxWidth: "100%", borderRadius: "10px", marginBottom: "1rem" }}
        />

        <div style={backgroundBox}>
          <p
            className="mb-4"
            style={{
              fontSize: "1.1rem",
              lineHeight: "1.7",
            }}
          >
            {game.description_raw}
          </p>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between mb-4 gap-3">
          <div style={backgroundBox}>
            <span style={{ fontWeight: "bold", color: "#0ff" }}>Released:</span>{" "}
            <span style={{ fontStyle: "italic" }}>{game.released}</span>
          </div>
          <div style={backgroundBox}>
            <span style={{ fontWeight: "bold", color: "#ff0" }}>Rating:</span>{" "}
            <span style={{ fontSize: "1.2rem", color: "#fefefe" }}>
              {game.rating}
            </span>
          </div>
        </div>

        <h3
          className="mt-5"
          style={{
            fontSize: "2rem",
            borderBottom: "1px solid #555",
            paddingBottom: "0.5rem",
            marginBottom: "1rem",
            ...backgroundBox,
          }}
        >
          Screenshots
        </h3>

        <div
  className="mt-3"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
  }}
>
  {screenshots.length > 0 ? (
    screenshots.map((shot) => (
      <img
        key={shot.id}
        src={shot.image}
        alt="Game screenshot"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        }}
      />
    ))
  ) : (
    <p style={{ color: "#fff" }}>No screenshots available for this game.</p>
  )}
</div>

      </div>
    </div>
  );
};
