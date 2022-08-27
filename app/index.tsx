import { render } from "preact";
import App from "./app";

render(<App />, document.getElementById("app") as HTMLDivElement);

const hot =  module && (module as any).hot;
if (hot) {
  hot.dispose(() => {
    window.location.reload();
    throw "hotReload";
  });
}
