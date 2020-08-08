# tmp steps
- `docker build -t soh:latest .`
- `docker run -it -p 9229:929 -v <full path to soh>:/soh soh:latest`
- shell in, `nginx`
- in shell `node --experimental-modules soh.mjs`
