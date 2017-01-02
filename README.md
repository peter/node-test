# Swagger based Node REST API

## Minimizing dependencies

I strive to minimize dependencies and rely on the Node core library instead where
possible. The Express framework has around 4 thousand lines of code but with about
40 dependencies the total code size is around 14 thousand lines of code. It turns
out a basic JSON REST API can be built with a much smaller codebase.

## TODO

* Handle swagger data types in query/body/params parsing
* Swagger validation for query/body/params parsing
