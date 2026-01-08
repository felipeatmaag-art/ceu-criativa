import Artists from './pages/Artists';
import Brindes from './pages/Brindes';
import Cart from './pages/Cart';
import Competitions from './pages/Competitions';
import Create from './pages/Create';
import DesignDetail from './pages/DesignDetail';
import Explore from './pages/Explore';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import MyDesigns from './pages/MyDesigns';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CompetitionDetail from './pages/CompetitionDetail';
import ArtistProfile from './pages/ArtistProfile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Artists": Artists,
    "Brindes": Brindes,
    "Cart": Cart,
    "Competitions": Competitions,
    "Create": Create,
    "DesignDetail": DesignDetail,
    "Explore": Explore,
    "Favorites": Favorites,
    "Home": Home,
    "MyDesigns": MyDesigns,
    "MyOrders": MyOrders,
    "Profile": Profile,
    "Settings": Settings,
    "CompetitionDetail": CompetitionDetail,
    "ArtistProfile": ArtistProfile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};