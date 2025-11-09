import MoneyInput from "./Components/FundingInput";
import PdfUploader from "./Components/PdfUploader";
import PdfTitle from "./Components/Header";
import ScrollToBottomButton from "./Components/ScrollToBottomButton";
import "./App.css";

export default function App() {
  return (
    <div className="page">
      <div className="card">
        <PdfTitle />
        <PdfUploader />
      </div>
      {/* sentinel element at the bottom of the page for precise scrolling */}
      <div id="page-bottom" style={{ width: 0, height: 0 }} />

      {/* floating button that scrolls to the bottom */}
      <ScrollToBottomButton targetId="page-bottom" />
    </div>
  );
}
