import "./app.css";
import { CanvasRender } from "./CanvasRender";

export function App() {
  const filename = `${new URLSearchParams(location.search).get("file")}`;

  const url = `${filename}`;
  return (
    <div className="App">
      <div className="title">
        <strong>Filename: </strong>{url.split("/")[url.split("/").length - 1]}
      </div>
      <CanvasRender url={url} rotate={0} />
      <CanvasRender url={url} rotate={1} />
    </div>
  );
}

