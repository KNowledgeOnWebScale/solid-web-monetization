import {
  HashRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { SessionProvider } from "@inrupt/solid-ui-react";
import MyNav from "./MyNav";

import "./App.scss";
import Wallet from "./pages/wallet/Wallet";
import Auth from "./pages/auth/Auth";
import { Home } from "./pages/home/Home";
import { About } from "./pages/about/About";


export default function App() {
  // const { session } = useSession();

  return (
    <SessionProvider sessionId="solid-web-monetization" restorePreviousSession={true}>
      <Router hashType="noslash">
        <MyNav />

        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/about" component={About} />
          <Route path="/auth" component={Auth} />
        </Switch>

      </Router>
    </SessionProvider>
  );
}
