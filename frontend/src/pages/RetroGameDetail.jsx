import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import projectimage1 from "../../img/projectimage1.png";

export const RetroGameDetails = () => {
  const { uid } = useParams(); // uid will be used as slug
  const [game, setGame] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBackendUrl = () => {
    let backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3001/api";
    if (!backendUrl.endsWith("/api")) {
      backendUrl = backendUrl.endsWith("/") ? `${backendUrl}api` : `${backendUrl}/api`;
    }
    return backendUrl;
  };

  useEffect(() => {
    const fetchRetroGameDetails = async () => {
      try {
        const backendUrl = getBackendUrl();

        // Fetch game details
        const res = await fetch(`${backendUrl}/retrogames/${uid}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const gameData = await res.json();
        setGame(gameData);

        // Fetch screenshots
        if (gameData.id) {
          const screenshotsRes = await fetch(
            `${backendUrl}/retrogames/${gameData.id}/screenshots`
          );
          if (!screenshotsRes.ok) throw new Error(`HTTP error! status: ${screenshotsRes.status}`);
          const screenshotsData = await screenshotsRes.json();
          setScreenshots(screenshotsData.results || []);
        }
      } catch (error) {
        console.error("Error fetching retro game details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetroGameDetails();
  }, [uid]);

  if (loading) return <div className="text-white text-center mt-5">Loading...</div>;
  if (!game) return <div className="text-white text-center mt-5">Game not found</div>;

  const backgroundBox = {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
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
        width: "100vw",
        minHeight: "100vh",
        paddingTop: "2rem",
      }}
    >
      <div className="container text-white p-4" style={{ maxWidth: 900 }}>
        <div style={backgroundBox}>
          <h2>{game.name}</h2>
        </div>

        {game.background_image && (
          <img
            src={game.background_image}
            alt={game.name}
            style={{
              width: "100%",
              maxWidth: "600px",
              height: "auto",
              borderRadius: "1rem",
              marginBottom: "1rem",
            }}
          />
        )}

        <div style={backgroundBox}>
          <p>{game.description_raw}</p>
        </div>

        <div
          className="mt-4 mb-3"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={backgroundBox}>
            <strong style={{ color: "#0ff" }}>Release Date:</strong>{" "}
            <em>{game.released || "Unknown"}</em>
          </div>

          {game.genres?.length > 0 && (
            <div style={backgroundBox}>
              <strong style={{ color: "#f90" }}>Genres:</strong>{" "}
              {game.genres.map((g) => g.name).join(", ")}
            </div>
          )}
        </div>

        <div
          className="mb-4"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          {game.platforms?.length > 0 && (
            <div style={backgroundBox}>
              <strong style={{ color: "#0ff" }}>Platforms:</strong>{" "}
              {game.platforms.map((p) => p.name).join(", ")}
            </div>
          )}

          {game.involved_companies?.length > 0 && (
            <div style={backgroundBox}>
              <strong style={{ color: "#0ff" }}>Developer:</strong>{" "}
              {game.involved_companies.find((c) => c.developer)?.company?.name || "N/A"}
            </div>
          )}

          {game.rating && (
            <div style={backgroundBox}>
              <strong style={{ color: "#ff0" }}>Rating:</strong>{" "}
              <span style={{ fontSize: "1.2rem", color: "#fefefe" }}>
                {Math.round(game.rating)} / 100
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-5" style={backgroundBox}>Screenshots</h3>

        <div
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
                  borderRadius: "1rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              />
            ))
          ) : (
            <div style={backgroundBox}>
              <p>No screenshots available for this game.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
