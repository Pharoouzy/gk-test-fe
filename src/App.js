import HomePage from "./views/HomePage";
import { Route, Switch } from "react-router-dom/";

function App() {
  return (
    <div>
      <Switch>
        <Route exact path="/" component={HomePage} />
      </Switch>
    </div>
  );
}

export default App;
