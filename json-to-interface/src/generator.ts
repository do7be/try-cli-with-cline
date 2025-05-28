import type { JsonValue, TypeInfo, GeneratedInterface } from "./types.ts";

export class InterfaceGenerator {
  private interfaceCounter = 0;
  private generatedInterfaces: GeneratedInterface[] = [];

  generateFromJson(json: JsonValue, rootName: string): string {
    this.interfaceCounter = 0;
    this.generatedInterfaces = [];

    const typeInfo = this.analyzeType(json, rootName);
    const mainInterface = this.generateInterface(rootName, typeInfo);

    // メインのinterfaceを最初に配置
    const allInterfaces = [mainInterface, ...this.generatedInterfaces];

    return allInterfaces.map((iface) => iface.content).join("\n\n");
  }

  private analyzeType(value: JsonValue, name?: string): TypeInfo {
    if (value === null) {
      return { type: "null" };
    }

    if (typeof value === "string") {
      return { type: "string" };
    }

    if (typeof value === "number") {
      return { type: "number" };
    }

    if (typeof value === "boolean") {
      return { type: "boolean" };
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { type: "unknown[]" };
      }

      // 配列の要素の型を分析
      const elementTypes = value.map((item) => this.analyzeType(item));
      const uniqueTypes = this.mergeTypes(elementTypes);

      if (uniqueTypes.length === 1) {
        return {
          type: "array",
          arrayElementType: uniqueTypes[0],
        };
      }

      // 複数の型が混在している場合はunion型
      return {
        type: "array",
        arrayElementType: { type: this.createUnionType(uniqueTypes) },
      };
    }

    if (typeof value === "object" && value !== null) {
      const properties: Record<string, TypeInfo> = {};

      for (const [key, val] of Object.entries(value)) {
        properties[key] = this.analyzeType(val, key);
      }

      return {
        type: "object",
        properties,
      };
    }

    return { type: "unknown" };
  }

  private mergeTypes(types: TypeInfo[]): TypeInfo[] {
    const typeMap = new Map<string, TypeInfo>();

    for (const type of types) {
      const key = this.getTypeKey(type);
      if (!typeMap.has(key)) {
        typeMap.set(key, type);
      }
    }

    return Array.from(typeMap.values());
  }

  private getTypeKey(type: TypeInfo): string {
    if (type.type === "array" && type.arrayElementType) {
      return `array<${this.getTypeKey(type.arrayElementType)}>`;
    }
    if (type.type === "object" && type.properties) {
      const propKeys = Object.keys(type.properties).sort();
      return `object{${propKeys.join(",")}}`;
    }
    return type.type;
  }

  private createUnionType(types: TypeInfo[]): string {
    return types.map((type) => this.typeInfoToString(type)).join(" | ");
  }

  private generateInterface(
    name: string,
    typeInfo: TypeInfo
  ): GeneratedInterface {
    if (typeInfo.type !== "object" || !typeInfo.properties) {
      throw new Error("Root type must be an object");
    }

    const interfaceName = this.toPascalCase(name);
    let content = `export interface ${interfaceName} {\n`;

    for (const [key, propType] of Object.entries(typeInfo.properties)) {
      const propName = this.isValidIdentifier(key) ? key : `"${key}"`;
      const optional = propType.isOptional ? "?" : "";
      const typeString = this.typeInfoToString(propType);

      content += `  ${propName}${optional}: ${typeString};\n`;
    }

    content += "}";

    return { name: interfaceName, content };
  }

  private typeInfoToString(typeInfo: TypeInfo): string {
    switch (typeInfo.type) {
      case "string":
      case "number":
      case "boolean":
      case "null":
      case "unknown":
        return typeInfo.type;

      case "array":
        if (typeInfo.arrayElementType) {
          const elementType = this.typeInfoToString(typeInfo.arrayElementType);
          return `${elementType}[]`;
        }
        return "unknown[]";

      case "object":
        if (typeInfo.properties) {
          // ネストしたオブジェクトの場合、新しいinterfaceを生成
          const interfaceName = `Interface${++this.interfaceCounter}`;
          const nestedInterface = this.generateInterface(
            interfaceName,
            typeInfo
          );
          this.generatedInterfaces.push(nestedInterface);
          return interfaceName;
        }
        return "object";

      default:
        return typeInfo.type;
    }
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, " ")
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  private isValidIdentifier(str: string): boolean {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
  }
}
