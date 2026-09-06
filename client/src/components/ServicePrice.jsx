import { formatServicePrice, startingPriceNote } from "../../../shared/catalog";

export function ServicePrice({ service }) {
  return <>{formatServicePrice(service)}</>;
}

export function StartingPriceNote({ service }) {
  if (service?.price_type !== "starting_from") return null;
  return <small className="starting-price-note">{startingPriceNote}</small>;
}
