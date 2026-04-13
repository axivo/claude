# Vendor Libraries

Vendored ESM bundles used to avoid runtime network dependencies in the container environment. Update to latest versions by running the commands below.

```bash
cd ./plugins/framework/skills/framework-initialization/scripts/memory/lib/vendor
curl -L "https://cdn.jsdelivr.net/npm/js-yaml/+esm" -o js-yaml.min.mjs
curl -L "https://cdn.jsdelivr.net/npm/markdown-ast/+esm" -o markdown-ast.min.mjs
npm install --prefix=/tmp/octokit-request esbuild @octokit/request@latest
VERSION=$(node -e "console.log(require('/tmp/octokit-request/node_modules/@octokit/request/package.json').version)")
npx --prefix=/tmp/octokit-request esbuild --bundle --format=esm --legal-comments=none --minify \
  --banner:js="/* Bundled with esbuild - @octokit/request@${VERSION} */" --outfile=octokit-request.min.mjs \
  /tmp/octokit-request/node_modules/@octokit/request/dist-src/index.js
rm -rf /tmp/octokit-request
```
