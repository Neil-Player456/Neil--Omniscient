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
  // TODO: Implement getUser functionality
  // let response = await fetch(import.meta.env.VITE_BACKEND_URL + "/profile", {
  //   method: "GET",
  //   headers: { Authorization: "Bearer " + payload },
  // });
  // let data = await response.json();
  // dispatch({
  //   type: "set_user",
  //   payload: { user: data.user, access_token: payload },
  // });
  return null;
};

export const getVintageGames = async (dispatch, payload) => {
  const { limit = 500, offset = 0 } = payload || {};
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    console.error("VITE_BACKEND_URL is not set!");
    return;
  }
  

  const url = `${backendUrl}/retrogames`;
  console.log("Fetching from:", url);
  
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        limit,
        offset,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();

    dispatch({
      type: "add_vintageGames",
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Error fetching vintage games:", error);
    console.error("Backend URL:", backendUrl);
    console.error("Full URL:", url);
    // Return empty array on error so the app doesn't crash
    dispatch({
      type: "add_vintageGames",
      payload: [],
    });
    return [];
  }
};

export const getRawgGames = async (dispatch, payload) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001/api';
  try {
    let response = await fetch(
      `${backendUrl}/rawg/games`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
        console.error("Backend error response:", JSON.stringify(errorData, null, 2));
      } catch (e) {
        const text = await response.text();
        console.error("Backend error (non-JSON):", text);
        errorData = { error: text || response.statusText };
      }
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || errorData.message || response.statusText}`);
    }

    let data = await response.json();

    dispatch({
      type: "add_RawgGames",
      payload: data.results,
    });
  } catch (error) {
    console.error("Error fetching RAWG games:", error);
    // Dispatch empty array on error so the app doesn't crash
    dispatch({
      type: "add_RawgGames",
      payload: [],
    });
  }
};

export const getGameDescription = async (slug) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001/api';
  const response = await fetch(
    `${backendUrl}/rawg/games/${slug}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
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
