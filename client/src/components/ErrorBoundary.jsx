import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="container not-found">
        <h1>Un instant…</h1>
        <p>La page n’a pas pu se charger. Veuillez réessayer.</p>
        <button className="button" onClick={() => window.location.reload()}>
          RECHARGER LA PAGE
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
