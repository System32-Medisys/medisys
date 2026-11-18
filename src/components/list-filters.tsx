import { field, type ListParams } from "@/lib/list-filters";
import { formatStatus } from "@/lib/format";

export function ListFilters({ action, params, fields, statuses }: {
  action: string; params: ListParams; fields: Array<[string, string, string?]>; statuses?: string[];
}) {
  return <form className="form card" method="get" action={action} aria-label="Filtros">
    {fields.map(([key, title, type]) => <label key={key}>{title}
      <input type={type ?? "search"} name={key} defaultValue={field(params, key)} />
    </label>)}
    {statuses && <label>Status<select name="status" defaultValue={field(params, "status")}>
      <option value="">Todos</option>
      {statuses.map((status) => <option value={status} key={status}>{formatStatus(status)}</option>)}
    </select></label>}
    <div><button type="submit">Filtrar</button> <a className="text-link" href={action}>Limpar</a></div>
  </form>;
}
