export enum CacheType {
  COMMON = "Common",
  NONE = "None",
  INDIVIDUAL = "Individual",
}

export type SchemaConfig = {
  path?: string;
  name?: string;
  description?: string;
  public?: boolean;
  cache?: CacheType;
  model?: string; //change this to defaultModel
  contentType?: "text" | "image";
};
