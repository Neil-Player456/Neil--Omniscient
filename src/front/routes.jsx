
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Games } from "./pages/Games";
import { RetroGames } from "./pages/Retrogames";
import { Merch } from "./pages/Merch";
import { Checkout } from "./pages/Checkout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { GameDetails } from "./pages/GamesDetail";
import { Profile } from "./pages/Profile";
import { MustLogin } from "./pages/MustLogin";
import { RetroGameDetails } from "./pages/RetroGameDetail";



export const router = createBrowserRouter(
  createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
        <Route path= "/" element={<Home />} />
        <Route path="/single/:theId" element={ <Single />} />  {/* Dynamic route for single items */}
        <Route path="/demo" element={<Demo />} />
        <Route path="/games" element={<Games />} />
        <Route path="/retrogames" element={<RetroGames />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login/" element={<Login />} />
        <Route path="/signup/" element={<Signup />} />
        <Route path="/game/:slug" element={<GameDetails />} />
        <Route path="/retrogame/:uid" element={<RetroGameDetails />} />
        <Route path="/profile/:theId" element={<Profile />} />
        <Route path="/must-login" element={<MustLogin />} />
      </Route>
    )
);
