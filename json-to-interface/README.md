# JSON to TypeScript Interface Generator

JSONファイルからTypeScriptのinterfaceを自動生成するCLIツールです。

## 特徴

- JSONファイルの構造を解析し、TypeScriptのinterfaceを生成
- ネストしたオブジェクトや配列にも対応
- 型推測機能（string, number, boolean, null, array, object）
- Denoランタイムで動作
- Biomeによるコードフォーマット

## 必要な環境

- [Deno](https://deno.land/) v1.28以上
- [Yarn](https://yarnpkg.com/) (開発時のパッケージ管理用)

## インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd json-to-interface

# 依存関係をインストール（開発用）
yarn install
```

## 使用方法

### 基本的な使用方法

```bash
deno run --allow-read --allow-write src/main.ts <JSONファイルのパス>
```

### 例

```bash
# サンプルファイルを使用
deno run --allow-read --allow-write src/main.ts examples/sample.json
```

これにより、`examples/sample-type.ts`ファイルが生成されます。

### 実行可能ファイルの作成

```bash
# バイナリファイルを生成
deno task build

# 生成されたバイナリを使用
./bin/json-to-interface examples/sample.json
```

## 出力例

入力JSON:
```json
{
  "name": "田中太郎",
  "age": 30,
  "isActive": true,
  "address": {
    "street": "東京都渋谷区",
    "zipCode": "150-0001"
  },
  "hobbies": ["読書", "映画鑑賞"]
}
```

生成されるTypeScript interface:
```typescript
export interface Sample {
  name: string;
  age: number;
  isActive: boolean;
  address: Interface1;
  hobbies: string[];
}

export interface Interface1 {
  street: string;
  zipCode: string;
}
```

## 開発

### フォーマット

```bash
deno task format
# または
yarn format
```

### リント

```bash
deno task lint
# または
yarn lint
```

### 開発モードで実行

```bash
deno task dev examples/sample.json
# または
yarn dev examples/sample.json
```

## 対応する型

- **string**: 文字列
- **number**: 数値
- **boolean**: 真偽値
- **null**: null値
- **array**: 配列（要素の型も推測）
- **object**: オブジェクト（ネストした構造も対応）

## 制限事項

- 空の配列は `unknown[]` として扱われます
- 配列内に複数の型が混在する場合はunion型として生成されます
- JSONのルートは必ずオブジェクトである必要があります

## ライセンス

MIT
