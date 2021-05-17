import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import "./App.scss";
import { About, Home, Wallet } from "./pages";
import MyNav from "./MyNav";

// This site has 3 pages, all of which are rendered
// dynamically in the browser (not server rendered).
//
// Although the page does not ever refresh, notice how
// React Router keeps the URL up to date as you navigate
// through the site. This preserves the browser history,
// making sure things like the back button and bookmarks
// work properly.

export default function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <MyNav />

      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/about" component={About} />
      </Switch>
    </Router>
  );
}
