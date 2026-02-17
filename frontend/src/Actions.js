const getBackendUrl = () => {
  let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001/api';
  if (!backendUrl.endsWith('/api')) {
    backendUrl = backendUrl.endsWith('/') ? `${backendUrl}api` : `${backendUrl}/api`;
  }
  return backendUrl;
};

export const signup = async (dispatch, payload) => {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/signup`, {
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
    const backendUrl = getBackendUrl();
    const resp = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      let errorMessage = "Login failed";
      try {
        const errorData = await resp.json();
        errorMessage = errorData.error || errorMessage;
        console.error("Login error:", errorMessage);
      } catch (e) {
        console.error("Login error: HTTP", resp.status, resp.statusText);
      }
      return false;
    }

    const data = await resp.json();

    if (!data.user || !data.access_token) {
      console.error("Login error: Missing user or access_token in response");
      return false;
    }

    dispatch({
      type: "set_user",
      payload: {
        user: data.user,
        access_token: data.access_token,
      },
    });

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

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
  
  const backendUrl = getBackendUrl();
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
    dispatch({
      type: "add_vintageGames",
      payload: [],
    });
    return [];
  }
};

export const getRawgGames = async (dispatch, payload) => {
  const backendUrl = getBackendUrl();
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
    dispatch({
      type: "add_RawgGames",
      payload: [],
    });
  }
};

export const getGameDescription = async (slug) => {
  const backendUrl = getBackendUrl();
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
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("No access token found, skipping user fetch");
      return;
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 422) {
        console.log("Token invalid or expired, clearing storage");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        dispatch({ type: "logout" });
        return;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();

    const user = data.user;
    const access_token = data.access_token;

    dispatch({ type: "set_user", payload: { user, access_token } });
    localStorage.setItem("user", JSON.stringify(user));
    if (access_token) {
      localStorage.setItem("access_token", access_token);
    }
  } catch (error) {
    console.error("Failed to fetch user by ID:", error);
    // Don't throw - just log the error so the app doesn't crash
  }
};

export const saveGameForLater = async (dispatch, payload) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to save games",
      };
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(
      `${backendUrl}/saved-games`,
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
      if (response.status === 401 || response.status === 422) {
        console.log("Token invalid or expired, clearing storage");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        dispatch({ type: "logout" });
        return {
          success: false,
          message: "Session expired. Please log in again.",
        };
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("Error saving game:", errorData);
      return {
        success: false,
        message: errorData.error || errorData.message || "Failed to save game",
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
    if (!token) {
      console.log("No access token found, skipping saved games fetch");
      dispatch({
        type: "set_saved_games",
        payload: [],
      });
      return [];
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(
      `${backendUrl}/saved-games`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
      // Get error details for debugging
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text();
        errorData = { error: text || response.statusText };
      }
      
      console.error("Failed to fetch saved games:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      if (response.status === 401 || response.status === 422) {
        console.log("Token invalid or expired, clearing storage");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        dispatch({ type: "logout" });
      }
      
      dispatch({
        type: "set_saved_games",
        payload: [],
      });
      return [];
    }
  } catch (error) {
    console.error("Error fetching saved games:", error);
    dispatch({
      type: "set_saved_games",
      payload: [],
    });
    return [];
  }
};

export const removeSavedGame = async (dispatch, gameId) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return {
        success: false,
        message: "You must be logged in to remove games",
      };
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(
      `${backendUrl}/saved-games`,
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
      if (response.status === 401 || response.status === 422) {
        console.log("Token invalid or expired, clearing storage");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        dispatch({ type: "logout" });
        return {
          success: false,
          message: "Session expired. Please log in again.",
        };
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to remove game:", errorData.error || response.statusText);
      return { success: false, message: errorData.error || "Failed to remove game" };
    }
  } catch (error) {
    console.error("Error removing game:", error);
    return { success: false, message: "Network error occurred" };
  }
};
