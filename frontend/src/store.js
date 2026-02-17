export const initialStore = () => {
  const access_token = localStorage.getItem("access_token");
  const userString = localStorage.getItem("user");

  let user = null;
  try {
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    localStorage.removeItem("user");
  }

  return {
    message: null,
    user: access_token ? user : null,
    access_token: access_token || null,
    vintageGames: [],
    rawgGames: [],
    save_for_later: [],
    gameReactions: {},
  };
};


export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_user":
      const { user, access_token } = action.payload;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        ...store,
        user: action.payload.user,
        access_token: action.payload.access_token,
      };

    case "add_vintageGames":
      return {
        ...store,
        vintageGames: action.payload,
      };

    case "add_RawgGames":
      return {
        ...store,
        rawgGames: action.payload,
      };

    case "save_for_later":
      return {
        ...store,
        save_for_later: [...store.save_for_later, action.payload],
      };

    case "update_about":
      const updatedUser = { ...store.user, about: action.payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return {
        ...store,
        user: updatedUser,
      };

    case "logout":
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("access_token");

      return {
        ...store,
        user: null,
        access_token: null,
      };

    case "set_saved_games":
      return {
        ...store,
        save_for_later: action.payload,
      };

    default:
      console.error("Unknown action type:", action.type);
      return store;
  }
}
