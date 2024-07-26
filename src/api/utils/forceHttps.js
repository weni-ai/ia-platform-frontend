export default function forceHttps(receivedUrl) {
  const url = new URL(receivedUrl);

  url.protocol = 'https:';

  return url.toString();
}
