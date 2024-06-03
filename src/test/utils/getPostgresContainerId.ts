import execPromise from "../../utils/execPromise";

export default async function (): Promise<string> {
  return execPromise(`docker ps -q --filter "expose=5432"`);
}
