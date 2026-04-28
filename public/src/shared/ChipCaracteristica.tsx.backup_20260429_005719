interface Props {
  activo: boolean;
  emoji: string;
  label: string;
}

export default function ChipCaracteristica({ activo, emoji, label }: Props) {
  if (!activo) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-100">
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
