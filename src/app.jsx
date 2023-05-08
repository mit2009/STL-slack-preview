// import { useState, useEffect, useRef } from "react";
// import { StlViewer } from "react-stl-viewer";

import "./app.css";

// export function App() {

//   const filename = `${new URLSearchParams(location.search).get("file")}`;
//   console.log
//   const style = {
//     width: '100vw',
//     height: '100vh',
//   }
//   const url = `http://localhost:3001${filename}`;
//   console.log(url);

//   return (
//     <div className="App">
//       Testing the app! Hello! {filename}
//       <StlViewer
//         style={style}
//         orbitControls={true}
//         shadows={true}
//         url={url}
//         rotate={true}
//         modelProps={
//           {
//             color: `#00938F`,
//             scale: 1.1,
//           }
//         }
//       />
//     </div>
//   );
// }

import { CanvasRender } from "./CanvasRender";

export function App() {

  const filename = `${new URLSearchParams(location.search).get("file")}`;

  const url = `http://localhost:3001${filename}`;
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

