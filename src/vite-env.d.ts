/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When `"true"`, account requests skips persisted demo list seeding and can show an empty state. */
  readonly VITE_DISABLE_DEMO_SEED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
