// Central place that reads the sandbox flag. Every provider and every
// financial code path checks this — never a per-file guess.
export const SANDBOX_MODE = process.env.NEXT_PUBLIC_SANDBOX_MODE !== 'false';
