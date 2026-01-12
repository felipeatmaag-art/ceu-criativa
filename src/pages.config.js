import ArtistProfile from './pages/ArtistProfile';
import Artists from './pages/Artists';
import Brindes from './pages/Brindes';
import Cart from './pages/Cart';
import CompetitionDetail from './pages/CompetitionDetail';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "ArtistProfile": ArtistProfile,
    "Artists": Artists,
    "Brindes": Brindes,
    "Cart": Cart,
    "CompetitionDetail": CompetitionDetail,
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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};