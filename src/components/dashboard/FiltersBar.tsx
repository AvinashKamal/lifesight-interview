import { Select } from "../ui/Select";
import { TextInput } from "../ui/TextInput";

type FiltersBarProps = {
  channel: string | "all";
  channels: string[];
  search: string;
  onChannelChange: (value: string | "all") => void;
  onSearchChange: (value: string) => void;
};

export function FiltersBar({
  channel,
  channels,
  search,
  onChannelChange,
  onSearchChange,
}: FiltersBarProps) {
  return (
    <div className="filters">
      <Select
        label="Channel"
        value={channel}
        onChange={(e) =>
          onChannelChange(e.target.value === "all" ? "all" : e.target.value)
        }
      >
        <option value="all">All channels</option>
        {channels.map((ch) => (
          <option key={ch} value={ch}>
            {ch}
          </option>
        ))}
      </Select>

      <TextInput
        label="Search"
        placeholder="Search channel"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
