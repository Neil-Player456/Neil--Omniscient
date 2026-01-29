import React, { useEffect, useState } from "react";
import projectimage1 from "../assets/img/projectimage1.png";

export const Merch = () => {
  const vintageVideos = [
    { name: "Super Mario Bros.", youtubeId: "ia8bhFoqkVE" },
    { name: "The Legend of Zelda", youtubeId: "1rPxiXXxftE" },
    { name: "Super Mario Bros.", youtubeId: "NTa6Xbzfq1U" },
    { name: "Pac-Man", youtubeId: "QpKkApf-7Z0" },
    { name: "Super Mario Bros.", youtubeId: "RndsgsnvarA" },
    { name: "Tetris", youtubeId: "Ino2s8eEAyQ" },
  ];

  const [modernVideos, setModernVideos] = useState([]);
  const [loadingMoreModern, setLoadingMoreModern] = useState(false);
  const [modernPage, setModernPage] = useState(1);

  const RAWG_KEY = "e09cf7c5817241ee825687b3373f921f";
  const MODERN_PAGE_SIZE = 20;

  const fetchModernTrailers = async (page) => {
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${RAWG_KEY}&page=${page}&page_size=${MODERN_PAGE_SIZE}`
      );
      const data = await response.json();
      const trailerPromises = data.results.map(async (game) => {
        try {
          const movieRes = await fetch(
            `https://api.rawg.io/api/games/${game.slug}/movies?key=${RAWG_KEY}`
          );
          const movieData = await movieRes.json();
          const trailer = movieData.results?.[0];
          if (trailer?.data?.max) {
            return {
              name: game.name,
              video: trailer.data.max,
            };
          }
        } catch (err) {
          console.error("Error fetching trailer for", game.name, err);
        }
        return null;
      });
      const trailers = await Promise.all(trailerPromises);
      return trailers.filter((t) => t !== null);
    } catch (error) {
      console.error("Error fetching modern trailers:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadInitialTrailers = async () => {
      const initialTrailers = await fetchModernTrailers(1);
      setModernVideos(initialTrailers);
    };
    loadInitialTrailers();
  }, []);

  const loadMoreModernTrailers = async () => {
    setLoadingMoreModern(true);
    const nextPage = modernPage + 1;
    const moreTrailers = await fetchModernTrailers(nextPage);
    setModernVideos((prev) => [...prev, ...moreTrailers]);
    setModernPage(nextPage);
    setLoadingMoreModern(false);
  };

  return (
    <div
      className="d-flex justify-content-center"
      style={{
        backgroundImage: `url(${projectimage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        width: "100vw",
      }}
    >
      <div className="container py-5 text-white">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold">
            🎮 Gameplay Showcase
          </h1>
        </div>

        <section className="mb-5">
          <h2 className="h4 fw-semibold mb-4 text-center">
            <span className="display-4 fw-bold">
              🕹️ Vintage Gameplays
            </span>
          </h2>
          {vintageVideos.length === 0 ? (
            <p className="text-center text-light bg-dark bg-opacity-50 p-2 rounded">
              No vintage videos found.
            </p>
          ) : (
            <div className="row g-4">
              {vintageVideos.map((video, index) => (
                <div key={index} className="col-12 col-md-6 col-lg-4">
                  <div className="p-3 bg-dark bg-opacity-50 shadow rounded text-white">
                    <h5 className="mb-2">{video.name}</h5>
                    <div className="ratio ratio-16x9">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                        title={video.name}
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="h4 fw-semibold mb-4 text-center">
            <span className="display-4 fw-bold">
              🧩 Modern Game Trailers 
            </span>
          </h2>
          {modernVideos.length === 0 ? (
            <p className="text-center text-light bg-dark bg-opacity-50 p-2 rounded">
              No modern videos found.
            </p>
          ) : (
            <>
              <div className="row g-4 mb-4">
                {modernVideos.map((video, index) => (
                  <div key={index} className="col-12 col-md-6 col-lg-4">
                    <div className="p-3 bg-dark bg-opacity-50 shadow rounded text-white">
                      <h5 className="mb-2">{video.name}</h5>
                      <div className="ratio ratio-16x9">
                        <video
                          controls
                          className="w-100 h-100 rounded"
                          preload="metadata"
                        >
                          <source src={video.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button
                  onClick={loadMoreModernTrailers}
                  disabled={loadingMoreModern}
                  className="btn btn-light btn-lg"
                >
                  {loadingMoreModern ? "Loading..." : "Load More Trailers"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
