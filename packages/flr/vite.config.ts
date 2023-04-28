import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: ["./index.ts", "./jsx-runtime.ts", "./jsx-dev-runtime.ts"],
      name: "Jolt",
    },
  },
  plugins: [
    dts({
      // Dom has extra types, so use that config
      tsConfigFilePath: "./tsconfig.dom.json",
    }),
  ],
});
