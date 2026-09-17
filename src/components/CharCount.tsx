export default function CharCount({ value, max }: { value: string; max: number }) {
  const used = value.length;
  const near = used > max * 0.9;
  return (
    <span className={`text-[11px] tabular-nums ${near ? "text-flame" : "text-paper-dim"}`}>
      {used}/{max}
    </span>
  );
}
