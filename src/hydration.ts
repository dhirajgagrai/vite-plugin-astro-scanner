const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
export const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));