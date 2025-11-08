import { useState } from "react";

export default function MoneyInput() {
  const [amount, setAmount] = useState("");

  // Function to handle input changes
  const handleChange = (e) => {
    // Optionally, remove non-numeric characters except dot
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  // Example function using the amount
  const handleSubmit = () => {
    // You now have the variable amount to use in your JS logic
    console.log("Money amount:", amount);
  };

  return (
    <div className="container mt-3">
      <div className="mb-3">
        <label htmlFor="moneyInput" className="form-label">
          Enter Amount
        </label>
        <input
          type="text"
          className="form-control"
          id="moneyInput"
          placeholder="$0.00"
          value={amount}
          onChange={handleChange}
        />
      </div>
      <button className="btn btn-primary" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}
