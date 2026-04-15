import { LeadFilters } from "@/lib/search/leads";
import { leadStatusOptions, occupancyOptions, sourceTypeOptions } from "@/lib/search/filters";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function FilterBar({ filters }: { filters: LeadFilters }) {
  return (
    <form className="grid gap-3 rounded-[28px] border border-slate-200 bg-white/85 p-4 shadow-panel md:grid-cols-4 xl:grid-cols-8">
      <Input name="query" placeholder="Search address, owner, APN" defaultValue={filters.query} />
      <Input name="county" placeholder="County" defaultValue={filters.county} />
      <Select name="sourceType" defaultValue={filters.sourceType}>
        <option value="">All sources</option>
        {sourceTypeOptions.map((sourceType) => (
          <option key={sourceType} value={sourceType}>
            {sourceType.replaceAll("_", " ")}
          </option>
        ))}
      </Select>
      <Input name="minScore" type="number" placeholder="Min score" defaultValue={filters.minScore} />
      <Input name="maxScore" type="number" placeholder="Max score" defaultValue={filters.maxScore} />
      <Input name="startDate" type="date" defaultValue={filters.startDate} />
      <Input name="endDate" type="date" defaultValue={filters.endDate} />
      <Select name="occupancy" defaultValue={filters.occupancy}>
        {occupancyOptions.map((option) => (
          <option key={option} value={option}>
            {option === "ALL" ? "All occupancy" : option.replaceAll("_", " ")}
          </option>
        ))}
      </Select>
      <Select name="status" defaultValue={filters.status}>
        {leadStatusOptions.map((option) => (
          <option key={option} value={option}>
            {option === "ALL" ? "All statuses" : option.replaceAll("_", " ")}
          </option>
        ))}
      </Select>
      <Input name="tag" placeholder="Tag (e.g. probate)" defaultValue={filters.tag} />
      <div className="flex gap-3">
        <Button type="submit" className="w-full">
          Apply filters
        </Button>
      </div>
    </form>
  );
}
