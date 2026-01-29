export const signup = async (dispatch, payload) => {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/signup", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Signup error:", errorData);
      return false;
    }

    
    const data = await response.json();
    return true;
  } catch (error) {
    console.error("Network or fetch error:", error);
    return false;
  }
};

export const login = async (dispatch, payload) => {
  try {
    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) return false;

    const data = await resp.json();

    if (!data.user || !data.access_token) return false;

    dispatch({
      type: "set_user",
      payload: {
        user: data.user,
        access_token: data.access_token,
      },
    });

    return true;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};


export const logout = (dispatch) => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("access_token");

  dispatch({
    type: "logout",
  });
};

export const getUser = async (dispatch, payload) => {
  //   // let response = await fetch(import.meta.env.VITE_BACKEND_URL + "/profile", {
  //   //   method: "Get",
  //   //   headers: { Authorization: "Bearer " + payload },
  //   // });
  //   // let data = await response.json();
  //   // dispatch({
  //   //   type: "set_user",
  //   //   payload: { user: data.user, access_token: payload },
  //   // });
};

export const getVintageGames = async (dispatch, payload) => {
  const { limit = 500, offset = 0 } = payload || {};
  
  let response = await fetch(import.meta.env.VITE_BACKEND_URL + "/retrogames", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      limit,
      offset,
    }),
  });

  let data = await response.json();

  dispatch({
    type: "add_vintageGames",
    payload: data,
  });

  return data; 
};

export const getRawgGames = async (dispatch, payload) => {
  let response = await fetch(
    "https://api.rawg.io/api/games?key=e09cf7c5817241ee825687b3373f921f",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  let data = await response.json();

  dispatch({
    type: "add_RawgGames",
    payload: data.results,
  });
};

export const getGameDescription = async (slug) => {
  const response = await fetch(
    `https://api.rawg.io/api/games/${slug}?key=e09cf7c5817241ee825687b3373f921f`
  );
  const data = await response.json();
  return {
    slug: slug,
    name: data.name,
    description: data.description_raw || data.description,
  };
};

export const getUserById = async (dispatch) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const user = data.user;
    const access_token = data.access_token;

    dispatch({ type: "set_user", payload: { user, access_token } });
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Failed to fetch user by ID:", error);
  }
};

export const saveGameForLater = async (dispatch, payload) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/saved-games`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );
    if (response.ok) {
      const data = await response.json();
      dispatch({
        type: "set_saved_games",
        payload: data.saved_games,
      });
      return { success: true, message: "Game saved successfully!" };
    } else {
      const errorData = await response.json();
      console.error("Error saving game:", errorData);
      return {
        success: false,
        message: errorData.message || "Failed to save game",
      };
    }
  } catch (error) {
    console.error("Network error:", error);
    return { success: false, message: "Network error occurred" };
  }
};

export const getSavedGames = async (dispatch) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/saved-games`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const savedGames = await response.json();
      dispatch({
        type: "set_saved_games",
        payload: savedGames,
      });
      return savedGames;
    } else {
      console.error("Failed to fetch saved games");
      return [];
    }
  } catch (error) {
    console.error("Error fetching saved games:", error);
    return [];
  }
};

export const removeSavedGame = async (dispatch, gameId) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/saved-games`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ game_id: gameId }),
      }
    );
    if (response.ok) {
      getSavedGames(dispatch);
      return { success: true };
    } else {
      console.error("Failed to remove game");
      return { success: false };
    }
  } catch (error) {
    console.error("Error removing game:", error);
    return { success: false };
  }
};
