export const base64URLEncode = <T>(obj: T): string => {
  return Buffer.from(JSON.stringify(obj), "utf-8").toString("base64url");
};

export const base64URLDecode = <T>(buffer: string): T => {
  return JSON.parse(Buffer.from(buffer, "base64url").toString("utf-8"));
};
