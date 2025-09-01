import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Example bundle prices
  const bundles = {
    MTN: [
      { size: "1GB", price: 5.3 },
      { size: "2GB", price: 10.5 },
      { size: "3GB", price: 15.4 },
      { size: "4GB", price: 20.3 },
      { size: "5GB", price: 25.2 },
      { size: "30GB", price: 150.0 }
    ],
    TELECEL: [
      { size: "5GB", price: 24.5 },
      { size: "10GB", price: 45.0 },
      { size: "15GB", price: 60.0 },
      { size: "20GB", price: 80.0 },
      { size: "25GB", price: 100.0 },
      { size: "30GB", price: 111.0 }
    ],
    AFA: [{ size: "Registration", price: 8.0 }]
  };

  const handlePayment = async () => {
    if (!amount || !recipient || !email) {
      alert("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/initialize", {
        amount,
        email,
        recipient,
      });
      window.location.href = res.data.authorization_url;
    } catch (error) {
      alert("Payment initialization failed.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Datastore4GH</h1>
      <p>Buy MTN, TELECEL, TIGO Bundles & AFA Membership</p>

      <h2>📦 Bundles</h2>
      {Object.keys(bundles).map((network) => (
        <div key={network}>
          <h3>{network}</h3>
          <ul>
            {bundles[network].map((b, i) => (
              <li key={i}>
                {b.size} - GHS {b.price}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h2>💳 Purchase</h2>
      <div>
        <input
          type="text"
          placeholder="Recipient Number"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Amount (GHS)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
        }
