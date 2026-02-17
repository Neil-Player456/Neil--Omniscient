import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import projectimage1 from "../../img/projectimage1.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Profile = () => {
  const navigate = useNavigate();
  const { theId } = useParams();
  const { store, dispatch, getUserById, getSavedGames,removeSavedGame} = useGlobalReducer();
  const [message, setMessage] = useState("");
  const [about, setAbout] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (theId && !store.user) {
      getUserById(theId);
    }
  }, [theId, store.user]);

  useEffect(() => {
    if (store.user?.about !== undefined) {
      setAbout(store.user.about);
    }
  }, [store.user?.about]);

  useEffect(() => {
    if (store.user && store.user.id) {
      getSavedGames(store.user.id);
    }
  }, [store.user]);

  useEffect(() => {
    if (!store.access_token || !store.user) {
      console.log("Redirecting to /must-login");
      navigate("/must-login");
    } else {
      setMessage(`Hello! ${store.user.email}`);
      setAbout(store.user.about || "");
    }
  }, [store.user, store.access_token]);

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ about }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        dispatch({
          type: "update_about",
          payload: about,
        });
        setSuccessMsg("About updated successfully!");
        setIsEditing(false);
      } else {
        setSuccessMsg(`Error: ${data.error || "Something went wrong"}`);
      }
    } catch (err) {
      setSuccessMsg("Failed to update about info.");
    }
  };

  const handleDeleteGame = async (gameId) => {
    removeSavedGame(gameId)
  };

  const handleDeleteAbout = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ about: "" }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        dispatch({ type: "update_about", payload: "" });
        setAbout("");
        setSuccessMsg("About section deleted.");
        setIsEditing(false);
      } else {
        setSuccessMsg(`Error: ${data.error || "Something went wrong"}`);
      }
    } catch (err) {
      setSuccessMsg("Failed to delete about section.");
    }
  };

  return (
    <div
      className="text-center container-fluid"
      style={{
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
      }}
    >
      <div className="account-card mx-auto mt-10 p-6 rounded-2xl text-white text-center bg-[#4A007D] shadow-lg">
        <div className="photo mb-4">
          <img
            src="https://i.pinimg.com/736x/5c/a7/c6/5ca7c68dabec33e530fd510941632abe.jpg"
            className="img-fluid"
            alt="..."
          ></img>
          <h1 className="username text-xl font-bold">{message}</h1>
          <div className="about-user">
            <h2>
              <strong>About</strong>
            </h2>
          </div>
          {isEditing ? (
            <div>
              <textarea
                className="text-sm text-white p-2 rounded w-full bg-transparent border-none"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={4}
              />
              <div className="save and delete">
                <button
                  className=" save mx-auto mt-2 bg-white text-[#4A007D] px-4 py-1 rounded font-bold"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className=" delete mt-2 bg-gray-300 text-black px-4 py-1 rounded font-bold"
                  onClick={handleDeleteAbout}
                >
                  Delete
                </button>
                <p className="text-green-200 mt-2">{successMsg}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="edit text-sm text-gray-200">{about}</p>
              <button
                className="mt-2 bg-white text-[#4A007D] px-4 py-1 rounded font-bold"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className="saved-games-card text-white text-center mt-10 bg-[#4A007D] rounded-2xl p-6 shadow-lg w-11/12 max-w-6xl overflow-y-auto"
        style={{ maxHeight: "500px" }}
      >
        <h2 className="text-2xl font-bold mb-4">Saved Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
          {store.save_for_later && store.save_for_later.length > 0 ? (
            store.save_for_later.map((game, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 p-3 rounded-2xl shadow-md text-white flex flex-col"
                style={{
                  minWidth: "18rem",
                  border: "1px solid rgba(10, 10, 10, 0.2)",
                  borderRadius: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  color: "white",
                }}
              >
                <img
                  src={`https:${game.img.replace("t_thumb", "t_cover_big")}`}
                  alt={game.name}
                  className="w-full max-h-28 object-cover rounded-xl mb-2"
                />
                <h3 className="text-lg font-semibold">{game.name}</h3>
                <p className="text-sm">{game.summary}</p>
                <button
                  onClick={() => handleDeleteGame(game.id)}
                  className="mt-2 bg-red-500 text-black px-3 py-1 rounded font-bold"
                >
                  Delete Game
                </button>
              </div>
            ))
          ) : (
            <p className="text-white">You haven't saved any games yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
