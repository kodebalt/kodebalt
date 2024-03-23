const CF_APP_VERSION = '1.0.0';

const logtailApiURL = 'https://in.logs.betterstack.com/';
let sourceToken;

const headers = [
  'rMeth',
  'rUrl',
  'uAgent',
  'cfRay',
  'cIP',
  'statusCode',
  'contentLength',
  'cfCacheStatus',
  'contentType',
  'responseConnection',
  'requestConnection',
  'cacheControl',
  'acceptRanges',
  'expectCt',
  'expires',
  'lastModified',
  'vary',
  'server',
  'etag',
  'date',
  'transferEncoding',
];

const options = {
  metadata: headers.map((value) => ({ field: value })),
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const makeid = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const buildLogMessage = (request, response) => {
  const logDefs = {
    rMeth: request.method,
    rUrl: request.url,
    uAgent: request.headers.get('user-agent'),
    cfRay: request.headers.get('cf-ray'),
    cIP: request.headers.get('cf-connecting-ip'),
    statusCode: response.status,
    contentLength: response.headers.get('content-length'),
    cfCacheStatus: response.headers.get('cf-cache-status'),
    contentType: response.headers.get('content-type'),
    responseConnection: response.headers.get('connection'),
    requestConnection: request.headers.get('connection'),
    cacheControl: response.headers.get('cache-control'),
    acceptRanges: response.headers.get('accept-ranges'),
    expectCt: response.headers.get('expect-ct'),
    expires: response.headers.get('expires'),
    lastModified: response.headers.get('last-modified'),
    vary: response.headers.get('vary'),
    server: response.headers.get('server'),
    etag: response.headers.get('etag'),
    date: response.headers.get('date'),
    transferEncoding: response.headers.get('transfer-encoding'),
  };

  const logArray = [];
  options.metadata.forEach((entry) => logArray.push(logDefs[entry.field]));
  return logArray.join(' | ');
};

const buildMetadataFromHeaders = (headers) => {
  const responseMetadata = {};
  Array.from(headers).forEach(([key, value]) => {
    responseMetadata[key.replace(/-/g, '_')] = value;
  });
  return responseMetadata;
};

// Batching
const BATCH_INTERVAL_MS = 500;
const MAX_REQUESTS_PER_BATCH = 100;
const WORKER_ID = makeid(6);

let workerTimestamp;

let batchTimeoutReached = true;
let logEventsBatch = [];

// Backoff
const BACKOFF_INTERVAL = 10000;
let backoff = 0;

async function addToBatch(body, connectingIp, event) {
  logEventsBatch.push(body);

  if (logEventsBatch.length >= MAX_REQUESTS_PER_BATCH) {
    event.waitUntil(postBatch(event));
  }

  return true;
}

async function handleRequest(event) {
  const { request } = event;

  const requestMetadata = buildMetadataFromHeaders(request.headers);

  const t1 = Date.now();
  const response = await fetch(request);
  const originTimeMs = Date.now() - t1;

  const rUrl = request.url;
  const rMeth = request.method;
  const rCf = request.cf;
  delete rCf.tlsClientAuth;
  delete rCf.tlsExportedAuthenticator;

  const responseMetadata = buildMetadataFromHeaders(response.headers);

  const eventBody = {
    message: buildLogMessage(request, response),
    dt: new Date().toISOString(),
    metadata: {
      response: {
        headers: responseMetadata,
        origin_time: originTimeMs,
        status_code: response.status,
      },
      request: {
        url: rUrl,
        method: rMeth,
        headers: requestMetadata,
        cf: rCf,
      },
      cloudflare_worker: {
        version: CF_APP_VERSION,
        worker_id: WORKER_ID,
        worker_started: workerTimestamp,
      },
    },
  };
  event.waitUntil(
    addToBatch(eventBody, requestMetadata.cf_connecting_ip, event)
  );

  return response;
}

const fetchAndSetBackOff = async (lfRequest, event) => {
  if (backoff <= Date.now()) {
    const resp = await fetch(logtailApiURL, lfRequest);
    if (resp.status === 403 || resp.status === 429) {
      backoff = Date.now() + BACKOFF_INTERVAL;
    }
  }

  event.waitUntil(scheduleBatch(event));

  return true;
};

const postBatch = async (event) => {
  const batchInFlight = [...logEventsBatch];
  logEventsBatch = [];
  const rHost = batchInFlight[0].metadata.request.headers.host;
  const body = JSON.stringify(batchInFlight);
  if (typeof sourceToken === 'undefined') {
    throw new Error('sourceToken has not been initialized.');
  }
  const request = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sourceToken}`,
      'Content-Type': 'application/json',
      'User-Agent': `Cloudflare Worker via ${rHost}`,
    },
    body,
  };
  event.waitUntil(fetchAndSetBackOff(request, event));
};

const scheduleBatch = async (event) => {
  if (batchTimeoutReached) {
    batchTimeoutReached = false;
    await sleep(BATCH_INTERVAL_MS);
    if (logEventsBatch.length > 0) {
      event.waitUntil(postBatch(event));
    }
    batchTimeoutReached = true;
  }
  return true;
};

export async function onRequest(event) {
  try {
    event.passThroughOnException();

    let workerTimestamp;
    if (!workerTimestamp) {
      workerTimestamp = new Date().toISOString();
    }

    sourceToken = event.env.SOURCE_TOKEN;
    await scheduleBatch(event);
    return await handleRequest(event);
  } catch (error) {
    console.error('An error occurred:', error);
    return new Response('An error occurred: ' + error, { status: 500 });
  }
}
