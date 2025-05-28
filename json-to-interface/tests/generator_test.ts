import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { InterfaceGenerator } from "../src/generator.ts";
import type { JsonValue } from "../src/types.ts";

Deno.test("InterfaceGenerator - 基本的な型の推測", async (t) => {
  const generator = new InterfaceGenerator();

  await t.step("文字列型を正しく推測する", () => {
    const json: JsonValue = { name: "test" };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("export interface Test {"), true);
    assertEquals(result.includes("name: string;"), true);
  });

  await t.step("数値型を正しく推測する", () => {
    const json: JsonValue = { age: 25 };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("age: number;"), true);
  });

  await t.step("真偽値型を正しく推測する", () => {
    const json: JsonValue = { isActive: true };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("isActive: boolean;"), true);
  });

  await t.step("null型を正しく推測する", () => {
    const json: JsonValue = { value: null };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("value: null;"), true);
  });
});

Deno.test("InterfaceGenerator - 配列型の推測", async (t) => {
  const generator = new InterfaceGenerator();

  await t.step("文字列配列を正しく推測する", () => {
    const json: JsonValue = { tags: ["tag1", "tag2", "tag3"] };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("tags: string[];"), true);
  });

  await t.step("数値配列を正しく推測する", () => {
    const json: JsonValue = { scores: [85, 92, 78] };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("scores: number[];"), true);
  });

  await t.step("空配列をunknown[]として推測する", () => {
    const json: JsonValue = { empty: [] };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("empty: unknown[];"), true);
  });

  await t.step("混在した型の配列をunion型として推測する", () => {
    const json: JsonValue = { mixed: ["text", 123, true] };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("mixed: (string | number | boolean)[];"), true);
  });
});

Deno.test("InterfaceGenerator - オブジェクト型の推測", async (t) => {
  const generator = new InterfaceGenerator();

  await t.step("ネストしたオブジェクトを正しく処理する", () => {
    const json: JsonValue = {
      user: {
        name: "John",
        age: 30
      }
    };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("export interface Test {"), true);
    assertEquals(result.includes("user: Interface1;"), true);
    assertEquals(result.includes("export interface Interface1 {"), true);
    assertEquals(result.includes("name: string;"), true);
    assertEquals(result.includes("age: number;"), true);
  });

  await t.step("深くネストしたオブジェクトを正しく処理する", () => {
    const json: JsonValue = {
      data: {
        user: {
          profile: {
            name: "John"
          }
        }
      }
    };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("data: Interface1;"), true);
    assertEquals(result.includes("user: Interface2;"), true);
    assertEquals(result.includes("profile: Interface3;"), true);
  });
});

Deno.test("InterfaceGenerator - 複雑な構造の処理", async (t) => {
  const generator = new InterfaceGenerator();

  await t.step("オブジェクトの配列を正しく処理する", () => {
    const json: JsonValue = {
      users: [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 }
      ]
    };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes("users: Interface1[];"), true);
    assertEquals(result.includes("export interface Interface1 {"), true);
    assertEquals(result.includes("name: string;"), true);
    assertEquals(result.includes("age: number;"), true);
  });

  await t.step("複雑なネスト構造を正しく処理する", () => {
    const json: JsonValue = {
      name: "Test User",
      age: 30,
      address: {
        street: "123 Main St",
        city: "Tokyo",
        coordinates: {
          lat: 35.6762,
          lng: 139.6503
        }
      },
      hobbies: ["reading", "coding"],
      scores: [85, 92, 78]
    };
    const result = generator.generateFromJson(json, "ComplexTest");

    assertEquals(result.includes("export interface ComplexTest {"), true);
    assertEquals(result.includes("name: string;"), true);
    assertEquals(result.includes("age: number;"), true);
    assertEquals(result.includes("address: Interface1;"), true);
    assertEquals(result.includes("hobbies: string[];"), true);
    assertEquals(result.includes("scores: number[];"), true);

    assertEquals(result.includes("export interface Interface1 {"), true);
    assertEquals(result.includes("street: string;"), true);
    assertEquals(result.includes("city: string;"), true);
    assertEquals(result.includes("coordinates: Interface2;"), true);

    assertEquals(result.includes("export interface Interface2 {"), true);
    assertEquals(result.includes("lat: number;"), true);
    assertEquals(result.includes("lng: number;"), true);
  });
});

Deno.test("InterfaceGenerator - エッジケース", async (t) => {
  const generator = new InterfaceGenerator();

  await t.step("無効なキー名を正しく処理する", () => {
    const json: JsonValue = {
      "invalid-key": "value",
      "123numeric": "value",
      "with space": "value"
    };
    const result = generator.generateFromJson(json, "Test");

    assertEquals(result.includes('"invalid-key": string;'), true);
    assertEquals(result.includes('"123numeric": string;'), true);
    assertEquals(result.includes('"with space": string;'), true);
  });

  await t.step("空のオブジェクトを正しく処理する", () => {
    const json: JsonValue = {};
    const result = generator.generateFromJson(json, "Empty");

    assertEquals(result.includes("export interface Empty {"), true);
    assertEquals(result.includes("}"), true);
  });

  await t.step("interface名をPascalCaseに変換する", () => {
    const json: JsonValue = { test: "value" };
    const result = generator.generateFromJson(json, "test-name_with-special");

    assertEquals(result.includes("export interface TestNameWithSpecial {"), true);
  });
});

Deno.test("InterfaceGenerator - エラーハンドリング", async (t) => {
  const generator = new InterfaceGenerator();

  await t.step("ルートがオブジェクトでない場合はエラーを投げる", () => {
    assertThrows(() => {
      generator.generateFromJson("not an object" as unknown as JsonValue, "Test");
    }, Error, "Root type must be an object");
  });

  await t.step("配列がルートの場合はエラーを投げる", () => {
    assertThrows(() => {
      generator.generateFromJson([1, 2, 3] as unknown as JsonValue, "Test");
    }, Error, "Root type must be an object");
  });
});
