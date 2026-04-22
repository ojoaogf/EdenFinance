declare module 'prisma/config' {
  export type PrismaConfig = {
    schema?: string;
    migrations?: { path: string; seed?: string };
    datasource?: { url: string; shadowDatabaseUrl?: string };
    experimental?: { externalTables?: boolean };
    tables?: { external?: string[] };
    enums?: { external?: string[] };
  };
  export function defineConfig(config: PrismaConfig): PrismaConfig;
  export function env(name: string): string;
}
