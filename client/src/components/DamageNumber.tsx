export function DamageNumber({ amount, kind }: { amount: number; kind: "damage" | "heal" }) {
  return <span className={`floating-number ${kind}`} aria-hidden="true">{kind === "damage" ? `-${amount}` : `+${amount}`}</span>;
}
