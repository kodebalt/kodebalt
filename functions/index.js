export async function onRequestGet(context) {
  context.env.LOGGER.fetch(context.request);
  const request = context.request;
  return env.ASSETS.fetch(request);
}