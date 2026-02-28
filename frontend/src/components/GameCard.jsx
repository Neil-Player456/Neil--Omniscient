import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link } from "react-router-dom";

export const GameCard = (props) => {
  const { store, dispatch, saveGameForLater } = useGlobalReducer();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const likesKey = `likes_${props.uid}`;
  const dislikesKey = `dislikes_${props.uid}`;

  const [likes, setLikes] = useState(() => {
    return Number(localStorage.getItem(likesKey)) || 0;
  });

  const [dislikes, setDislikes] = useState(() => {
    return Number(localStorage.getItem(dislikesKey)) || 0;
  });

  useEffect(() => {
    localStorage.setItem(likesKey, likes);
  }, [likes, likesKey]);

  useEffect(() => {
    localStorage.setItem(dislikesKey, dislikes);
  }, [dislikes, dislikesKey]);

  // ✅ Safe image resolver (RAWG + IGDB support)
  const getImageSrc = () => {
    if (props.background_image) {
      return props.background_image;
    }

    if (props.img) {
      if (props.img.startsWith("//")) {
        return `https:${props.img.replace("t_thumb", "t_cover_big")}`;
      }
      return props.img.replace("t_thumb", "t_cover_big");
    }

    return "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg";
  };

  const handleSaveForLater = async () => {
    setIsSaving(true);
    setSaveMessage("");

    const imageUrl = props.background_image || props.img || null;

    const gameData = {
      id: props.uid,
      name: props.name,
      uid: props.uid,
      img: imageUrl,
      summary: props.summary,
      cover: imageUrl ? { url: imageUrl } : null,
    };

    try {
      const result = await saveGameForLater(gameData);

      if (result && result.success) {
        setSaveMessage("Saved!");
        dispatch({
          type: "save_for_later",
          payload: gameData,
        });
      } else {
        setSaveMessage(result?.message || "Already saved");
      }
    } catch (error) {
      console.error("Error saving game:", error);
      setSaveMessage("Error saving");
      dispatch({
        type: "save_for_later",
        payload: gameData,
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 2000);
    }
  };

  const isGameSaved = store.save_for_later?.some(
    (savedGame) =>
      savedGame.uid === props.uid || savedGame.name === props.name
  );

  return (
    <div
      className="card text bg-transparent mb-3 h-100 text-center"
      style={{
        minWidth: "18rem",
        border: "2px solid blue",
        borderRadius: "1rem",
        background: "rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "white",
      }}
    >
      <div className="card-body">
        <Link
          to={`/retrogame/${props.uid}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <img
            src={getImageSrc()}
            className="card-img-top"
            alt={props.name || "Game Image"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg";
            }}
            style={{
              height: "300px",
              width: "100%",
              objectFit: "cover",
              borderRadius: ".5rem",
            }}
          />
        </Link>

        <h4 className="card-title mt-2">{props.name}</h4>

        <div className="d-flex justify-content-center gap-2 mt-2">
          <button
            className="btn btn-outline-success"
            onClick={() => setLikes((prev) => prev + 1)}
          >
            👍 {likes}
          </button>

          <button
            className="btn btn-outline-danger"
            onClick={() => setDislikes((prev) => prev + 1)}
          >
            👎 {dislikes}
          </button>

          <button
            className={`btn ${isGameSaved ? "btn-success" : "btn-primary"}`}
            onClick={handleSaveForLater}
            disabled={isSaving}
            title={isGameSaved ? "Already saved" : "Save for later"}
          >
            <i
              className={`fa-solid ${
                isGameSaved ? "fa-check" : "fa-bookmark"
              } me-1`}
            ></i>
            {isSaving
              ? "Saving..."
              : isGameSaved
              ? "Saved"
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};