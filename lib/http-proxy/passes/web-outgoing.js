var passes = exports;

/*!
 * Array of passes.
 *
 * A `pass` is just a function that is executed on `req, res, options`
 * so that you can easily add new checks while still keeping the base
 * flexible.
 */

[ // <--

  /**
   * If is a HTTP 1.0 request, remove chunk headers
   *
   * @param {ClientRequest} Req Request object
   * @param {IncomingMessage} Res Response object
   * @param {proxyResponse} Res Response object from the proxy request
   *
   * @api private
   */
  function removeChunked(req, res, proxyRes) {
    if(req.httpVersion === '1.0') {
      delete proxyRes.headers['transfer-encoding'];
    }
  },

  /**
   * If is a HTTP 1.0 request, set the correct connection header
   * or if connection header not present, then use `keep-alive`
   *
   * @param {ClientRequest} Req Request object
   * @param {IncomingMessage} Res Response object
   * @param {proxyResponse} Res Response object from the proxy request
   *
   * @api private
   */
  function setConnection(req, res, proxyRes) {
    if (req.httpVersion === '1.0') {
      proxyRes.headers.connection = req.headers.connection || 'close';
    } else if (!proxyRes.headers.connection) {
      proxyRes.headers.connection = req.headers.connection || 'keep-alive';
    }
  },

  /**
   * Copy headers from proxyResponse to response
   * set each header in response object.
   *
   * @param {ClientRequest} Req Request object
   * @param {IncomingMessage} Res Response object
   * @param {proxyResponse} Res Response object from the proxy request
   *
   * @api private
   */
  function writeHeaders(req, res, proxyRes) {
    Object.keys(proxyRes.headers).forEach(function(key) {
      res.setHeader(key, proxyRes.headers[key]);
    });
  },

  /**
   * Ensure content encoding is always plain on output 
   * if input is gzip.
   */
  function gzipToPlain(req, res, proxyRes) {
    if(proxyRes.headers["content-encoding"] == 'gzip') {
      res.setHeader('content-encoding', 'text/plain');  
    }  
  },
  /**
   * Set the statusCode from the proxyResponse
   *
   * @param {ClientRequest} Req Request object
   * @param {IncomingMessage} Res Response object
   * @param {proxyResponse} Res Response object from the proxy request
   *
   * @api private
   */
  function writeStatusCode(req, res, proxyRes) {
    res.writeHead(proxyRes.statusCode);
  }

] // <--
  .forEach(function(func) {
    passes[func.name] = func;
  });