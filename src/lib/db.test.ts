import { describe, it, expect } from "vitest";
import { pool, db } from "./db";

describe("Database Module (src/lib/db.ts)", () => {
  it("exports pool and db query helper objects", () => {
    expect(pool).toBeDefined();
    expect(db).toBeDefined();
    expect(typeof db.query).toBe("function");
  });

  it("exposes the same underlying pool on db.pool", () => {
    expect(db.pool).toBe(pool);
  });
});
