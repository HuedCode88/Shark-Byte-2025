import React, { useState } from "react";

function TextBox() {
  const [text, setText] = useState("");

  return (
    <div className="p-3 border rounded bg-light">
      <textarea
        className="form-control mb-3"
        rows="3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
      />
      <p>
        <strong>Output:</strong> {text}
      </p>
    </div>
  );
}
export default TextBox;
