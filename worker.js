addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const urlObject = new URL(request.url);

    // If the request is to a Vercel verification path, allow it to pass through
    if (urlObject.pathname.startsWith('/.well-known/')) {
      return await fetch(request);
    }

    // If the request is to the docs subdirectory
    if (/^\/docs/.test(urlObject.pathname)) {
      // Then Proxy to Mintlify
      const DOCS_URL = "ali-38001a3d.mintlify.dev";
      const CUSTOM_URL = "openyida.ai";

      let url = new URL(request.url);
      url.hostname = DOCS_URL;

      let proxyRequest = new Request(url, request);

      proxyRequest.headers.set("Host", DOCS_URL);
      proxyRequest.headers.set("X-Forwarded-Host", CUSTOM_URL);
      proxyRequest.headers.set("X-Forwarded-Proto", "https");
      // Preserve client IP
      proxyRequest.headers.set("CF-Connecting-IP", request.headers.get("CF-Connecting-IP"));

      return await fetch(proxyRequest);
    }

    // For root path, serve an iframe page embedding ai.aliwork.com
    if (urlObject.pathname === '/' || urlObject.pathname === '') {
      return new Response(getIframeHTML(), {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'X-Frame-Options': 'SAMEORIGIN',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      });
    }
  } catch (error) {
    // if no action found, play the regular request
    return await fetch(request);
  }

  return await fetch(request);
}

function getIframeHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenYida</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: #0066FF;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 1000;
        }
        .header-logo {
            color: white;
            font-size: 20px;
            font-weight: bold;
            text-decoration: none;
        }
        .header-nav {
            display: flex;
            gap: 20px;
        }
        .header-nav a {
            color: white;
            text-decoration: none;
            font-size: 14px;
        }
        .header-nav a:hover {
            text-decoration: underline;
        }
        .iframe-container {
            margin-top: 50px;
            width: 100%;
            height: calc(100% - 50px);
        }
    </style>
</head>
<body>
    <div class="header">
        <a href="/" class="header-logo">OpenYida</a>
        <div class="header-nav">
            <a href="/docs">文档</a>
            <a href="https://github.com/openyida/openyida" target="_blank">GitHub</a>
        </div>
    </div>
    <div class="iframe-container">
        <iframe src="https://ai.aliwork.com/o/openyida" allow="fullscreen"></iframe>
    </div>
</body>
</html>`;
}
