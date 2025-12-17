import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import Competitions from './pages/Competitions';
import Artists from './pages/Artists';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Explore": Explore,
    "Create": Create,
    "Competitions": Competitions,
    "Artists": Artists,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};