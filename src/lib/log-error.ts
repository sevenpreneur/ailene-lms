export default async function LogError(context: string, ...messages: unknown[]) {
  console.error(context + ":", ...messages);
}
