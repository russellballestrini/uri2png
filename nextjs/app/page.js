export default function Home() {
  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>uri2png</h1>
      <p>Screenshot any URI via a permacomputer.</p>
      <pre>{`GET /screenshot/capture/image?url=https://example.com
GET /screenshot/engines
GET /health`}</pre>
    </main>
  );
}
