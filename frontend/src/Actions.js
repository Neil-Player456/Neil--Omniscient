export const getBackendUrl = () => {
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

    await response.json();
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
      } catch {
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
      payload: { user: data.user, access_token: data.access_token },
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

  dispatch({ type: "logout" });
};

export const getVintageGames = async (dispatch, payload) => {
  const { limit = 500, offset = 0 } = payload || {};
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/retrogames`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit, offset }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    dispatch({ type: "add_vintageGames", payload: data });
    return data;
  } catch (error) {
    const isNetworkError = error.message?.includes("Failed to fetch") || 
                          error.message?.includes("NetworkError") ||
                          error.name === "TypeError";
    if (isNetworkError) {
      console.error("Error fetching vintage games: Backend server is not running. Please start it with 'pipenv run start' in the backend directory.");
    } else {
      console.error("Error fetching vintage games:", error);
    }
    dispatch({ type: "add_vintageGames", payload: [] });
    return [];
  }
};

export const getRawgGames = async (dispatch) => {
  const backendUrl = getBackendUrl();
  try {
    const response = await fetch(`${backendUrl}/rawg/games`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        errorData = { error: text || response.statusText };
      }
      throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    dispatch({ type: "add_RawgGames", payload: data.results });
  } catch (error) {
    const isNetworkError = error.message?.includes("Failed to fetch") || 
                          error.message?.includes("NetworkError") ||
                          error.name === "TypeError";
    if (isNetworkError) {
      console.error("Error fetching RAWG games: Backend server is not running. Please start it with 'pipenv run start' in the backend directory.");
    } else {
      console.error("Error fetching RAWG games:", error);
    }
    dispatch({ type: "add_RawgGames", payload: [] });
  }
};

export const getGameDescription = async (slug) => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/rawg/games/${slug}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  return { slug, name: data.name, description: data.description_raw || data.description };
};

export const getUserById = async (dispatch) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/user`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if ([401, 422].includes(response.status)) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        dispatch({ type: "logout" });
        return;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText);
    }

    const data = await response.json();
    dispatch({ type: "set_user", payload: { user: data.user, access_token: data.access_token } });
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.access_token) localStorage.setItem("access_token", data.access_token);
  } catch (error) {
    console.error("Failed to fetch user by ID:", error);
  }
};

// Alias for getUserById to maintain compatibility
export const getUser = getUserById;


export const saveGameForLater = async (dispatch, game) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return { success: false, message: "You must be logged in to save games" };

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/saved-games`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ game }), // Ensure backend expects { game: {...} }
    });

    const data = await response.json();

    if (!response.ok) {
      if ([401, 422].includes(response.status)) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        dispatch({ type: "logout" });
        return { success: false, message: "Session expired. Please log in again." };
      }
      console.error("Error saving game:", data);
      return { success: false, message: data.error || data.message || "Failed to save game" };
    }

    dispatch({ type: "set_saved_games", payload: data.saved_games });
    return { success: true, message: "Game saved successfully!" };
  } catch (error) {
    console.error("Network error saving game:", error);
    return { success: false, message: "Network error occurred" };
  }
};

export const getSavedGames = async (dispatch) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      dispatch({ type: "set_saved_games", payload: [] });
      return [];
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/saved-games`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to fetch saved games:", errorData);
      if ([401, 422].includes(response.status)) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        dispatch({ type: "logout" });
      }
      dispatch({ type: "set_saved_games", payload: [] });
      return [];
    }

    const savedGames = await response.json();
    dispatch({ type: "set_saved_games", payload: savedGames });
    return savedGames;
  } catch (error) {
    console.error("Error fetching saved games:", error);
    dispatch({ type: "set_saved_games", payload: [] });
    return [];
  }
};

export const removeSavedGame = async (dispatch, gameId) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return { success: false, message: "You must be logged in to remove games" };

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/saved-games`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ game_id: gameId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to remove game:", errorData);
      if ([401, 422].includes(response.status)) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        dispatch({ type: "logout" });
      }
      return { success: false, message: errorData.error || "Failed to remove game" };
    }

    await getSavedGames(dispatch);
    return { success: true };
  } catch (error) {
    console.error("Error removing game:", error);
    return { success: false, message: "Network error occurred" };
  }
};