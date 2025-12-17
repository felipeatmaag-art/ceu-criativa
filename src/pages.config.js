import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import Competitions from './pages/Competitions';
import Artists from './pages/Artists';
import DesignDetail from './pages/DesignDetail';
import Profile from './pages/Profile';
import MyDesigns from './pages/MyDesigns';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import MyOrders from './pages/MyOrders';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Explore": Explore,
    "Create": Create,
    "Competitions": Competitions,
    "Artists": Artists,
    "DesignDetail": DesignDetail,
    "Profile": Profile,
    "MyDesigns": MyDesigns,
    "Cart": Cart,
    "Favorites": Favorites,
    "MyOrders": MyOrders,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};