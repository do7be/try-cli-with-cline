import { basename, extname, join, dirname } from "@std/path";
import { InterfaceGenerator } from "./generator.ts";
import type { JsonValue } from "./types.ts";

async function main() {
  const args = Deno.args;

  if (args.length === 0) {
    console.error("使用方法: deno run --allow-read --allow-write src/main.ts <JSONファイルのパス>");
    console.error("例: deno run --allow-read --allow-write src/main.ts ./data.json");
    Deno.exit(1);
  }

  const inputPath = args[0];

  try {
    // JSONファイルを読み込み
    const jsonText = await Deno.readTextFile(inputPath);
    const jsonData: JsonValue = JSON.parse(jsonText);

    // ファイル名からinterface名を生成
    const fileName = basename(inputPath, extname(inputPath));
    const interfaceName = fileName.replace(/[^a-zA-Z0-9]/g, "");

    // InterfaceGeneratorを使用してTypeScriptのinterfaceを生成
    const generator = new InterfaceGenerator();
    const interfaceContent = generator.generateFromJson(jsonData, interfaceName);

    // 出力ファイル名を生成
    const outputFileName = `${fileName}-type.ts`;
    const outputPath = join(dirname(inputPath), outputFileName);

    // ファイルに書き込み
    await Deno.writeTextFile(outputPath, interfaceContent);

    console.log(`✅ TypeScriptのinterfaceを生成しました: ${outputPath}`);
    console.log("\n生成された内容:");
    console.log("─".repeat(50));
    console.log(interfaceContent);
    console.log("─".repeat(50));

  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`❌ エラー: ファイルが見つかりません: ${inputPath}`);
    } else if (error instanceof SyntaxError) {
      console.error(`❌ エラー: 無効なJSONファイルです: ${error.message}`);
    } else {
      console.error(`❌ エラー: ${error.message}`);
    }
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
