import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { SessionProvider, useSession } from "@inrupt/solid-ui-react";
import MyNav from "./MyNav";

import "./App.scss";
import { useEffect } from "react";
import { Home } from "./pages/home/Home";
import Wallet from "./pages/wallet/Wallet";
import { About } from "./pages/about/About";

export default function App() {
  const { session } = useSession();

  session.onSessionRestore((url) => {
    console.log(url);
  })

  useEffect(() => {
    session.handleIncomingRedirect({ restorePreviousSession: true }).then(info => console.log(info));
  }, [session]);

  return (
    <SessionProvider sessionId="solid-web-monetization">
      <Router basename="/solid-web-monetization">
        <MyNav />

        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/about" component={About} />
        </Switch>

      </Router>
    </SessionProvider>
  );
}
