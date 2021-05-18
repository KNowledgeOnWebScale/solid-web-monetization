import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import "./App.scss";
import { About, Home, Wallet } from "./pages";
import MyNav from "./MyNav";

export default function App() {
  return (
    <Router basename="/solid-web-monetization">
      <MyNav />

      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/about" component={About} />
      </Switch>
    </Router>
  );
}
