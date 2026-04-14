# Vendor Libraries

Vendored ESM bundles used to avoid runtime network dependencies in the container environment. Update to latest version by running the commands below.

```bash
cd ./plugins/framework/skills/framework-initialization/scripts/shared/vendor
curl -L "https://cdn.jsdelivr.net/npm/js-yaml/+esm" -o js-yaml.min.mjs
```
