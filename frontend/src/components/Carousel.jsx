import React from "react";
import { Link } from "react-router-dom";

export const Carousel = ({ games }) => {
  if (!games || games.length === 0) {
    return <p>No games to show.</p>;
  }

  const getImageSrc = (game) => {
    if (game.cover?.url) {
      return game.cover.url.startsWith("http")
        ? game.cover.url.replace("t_thumb", "t_screenshot_med")
        : `https:${game.cover.url.replace("t_thumb", "t_screenshot_med")}`;
    }

    if (game.background_image) return game.background_image;

    return "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg";
  };

  return (
    <div
      className="card mb-3"
      style={{
        minWidth: "18rem",
        backgroundColor: "transparent",
        border: "none",
      }}
    >
      <div
        id="carouselExampleIndicators"
        className="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="3000"
      >
        <div className="carousel-indicators">
          {games.map((game, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-current={index === 0 ? "true" : undefined}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>

        <div className="carousel-inner">
          {games.map((game, index) => (
            <div
              key={game.uid || game.id || index}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <Link
                to={`/retrogame/${game.uid || game.id || index}`}
                className="text-decoration-none"
              >
                <img
                  src={getImageSrc(game)}
                  alt={game.name || "Game Image"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg";
                  }}
                  className="d-block w-100"
                  style={{ height: "400px", objectFit: "cover" }}
                />

                <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
                  <h5>{game.name}</h5>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
};