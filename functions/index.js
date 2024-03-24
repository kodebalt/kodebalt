export async function onRequestGet(context) {
  context.env.LOGGER.fetch(context.request);
}