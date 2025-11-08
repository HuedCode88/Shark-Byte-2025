import MoneyInput from "./Components/FundingInput";
import PdfUploader from "./Components/PdfUploader";
import PdfTitle from "./Components/Header";
import "./App.css";

export default function App() {
  return (
    <div className="page">
      <div className="card">
        <PdfTitle />
        <MoneyInput />
        <PdfUploader />
      </div>
    </div>
  );
}
