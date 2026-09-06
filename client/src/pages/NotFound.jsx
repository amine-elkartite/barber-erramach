import { Button } from "../components/Common";
export default function NotFound() {
  return (
    <section className="container not-found">
      <p className="eyebrow">PAGE INTROUVABLE</p>
      <h1>
        <em>404</em>
      </h1>
      <h2>Une petite coupe dans votre itinéraire.</h2>
      <p>Cette page n’existe pas. Retrouvez notre salon et nos prestations.</p>
      <Button to="/">RETOUR À L’ACCUEIL</Button>
    </section>
  );
}
