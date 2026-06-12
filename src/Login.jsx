import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { S } from "./styles";
import { supabase } from "./lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const sendLink = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending"); setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) { setStatus("error"); setError(error.message); }
    else setStatus("sent");
  };

  return (
    <div style={S.loginWrap}>
      <div>
        <div style={S.loginBrand}>Inloggen</div>
        <div style={S.loginSubtitle}>
          Log in met een magic link om je kapitaal, bets en stortingen veilig
          te bewaren en te synchroniseren tussen je toestellen.
        </div>
      </div>

      <form style={S.loginCard} onSubmit={sendLink}>
        <span style={S.loginLabel}>E-mailadres</span>
        <input
          style={S.input}
          type="email"
          required
          autoFocus
          placeholder="naam@voorbeeld.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={status === "sending" || status === "sent"}
        />
        {status === "sent" ? (
          <div style={S.loginStatus}>
            Check je mailbox — we stuurden een inloglink naar <b>{email}</b>.
            Open de link op dit toestel om in te loggen.
          </div>
        ) : (
          <button className="press" style={S.cta} type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Versturen…" : "Stuur magic link"}
          </button>
        )}
        {status === "error" && (
          <div style={S.loginErrorText}>{error || "Er ging iets mis. Probeer opnieuw."}</div>
        )}
      </form>

      <button className="press" style={S.loginBack} onClick={() => navigate("/")}>
        ← Verder als gast (data blijft lokaal op dit toestel)
      </button>
    </div>
  );
}
