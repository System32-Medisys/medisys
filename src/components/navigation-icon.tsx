// Decorative, dependency-free icons; accessible names come from the menu labels.
const paths: Record<string, string> = {
  IN: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  CO: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 10h2m4 0h2m-8 4h2",
  EX: "M9 3H5v18h14V3h-4M9 2h6v4H9Zm-1 9h8m-8 4h8",
  PA: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 0a4 4 0 0 1 0 8",
  ME: "M6 3H4v6a5 5 0 0 0 10 0V3h-2m-3 11v3a4 4 0 0 0 8 0v-3m0-4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  CP: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm10 5v6m-3-3h6",
  AT: "M4 13v-1a8 8 0 0 1 16 0v1M4 12H2v6h4v-6Zm16 0h2v6h-4v-6Zm0 6v2h-6",
  TE: "M9 3h6m-5 0v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10",
  AU: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6",
  CF: "M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-7 0v6",
  SA: "M9 3H3v18h6m6-14 5 5-5 5m-6-5h11",
};

export function NavigationIcon({ name }: { name: string }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
