export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface TypeInfo {
  type: string;
  isOptional?: boolean;
  properties?: Record<string, TypeInfo>;
  arrayElementType?: TypeInfo;
}

export interface GeneratedInterface {
  name: string;
  content: string;
}
