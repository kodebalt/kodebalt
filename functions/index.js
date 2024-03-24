export async function onRequestGet(context) {
  context.env.LOGGER.fetch(context.request);
  const request = context.request;
  return new Response(request.body, request.headers);
}