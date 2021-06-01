import {
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import { SessionProvider } from "@inrupt/solid-ui-react";
import { MyNav } from "./components/my-nav/my-nav.component";

import { Wallet } from "./pages/wallet/wallet.component";
import { Auth } from "./pages/auth/auth.component";
import { Home } from "./pages/home/home.component";
import { About } from "./pages/about/about.component";

import "./App.scss";

export default function App() {
  const history = useHistory();
  const onSessionRestore = (url: string) => {
    const hash = url.indexOf('#');
    if (hash > -1) {
      history.push(url.substr(hash));
    } else {
      history.push('#');
    }
  }

  return (
      <SessionProvider sessionId="solid-web-monetization" restorePreviousSession={true} onSessionRestore={onSessionRestore}>
        <MyNav />

        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/about" component={About} />
          <Route path="/auth" component={Auth} />
        </Switch>
        
      </SessionProvider>
  );
}
