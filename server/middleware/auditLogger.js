const AccessLog = require('../models/nosql/AccessLog');

/**
 * Audit Logger Middleware
 * Automatically tracks visitor footprint, response latency, and client IP
 * with full support for Cloudflare Tunnel and reverse proxies.
 */
const auditLogger = (req, res, next) => {
  const startTime = Date.now();

  // Wait for the response to finish before recording metrics
  res.on('finish', async () => {
    try {
      const responseTimeMs = Date.now() - startTime;

      // Extract client IP address supporting Cloudflare Tunnel and proxy headers
      const cfConnectingIp = req.headers['cf-connecting-ip'];
      const xForwardedFor = req.headers['x-forwarded-for'];
      const xRealIp = req.headers['x-real-ip'];
      const rawRemoteIp = req.socket?.remoteAddress || req.ip;

      let clientIp = cfConnectingIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || xRealIp || rawRemoteIp || '127.0.0.1';

      // Clean IPv6 mapped IPv4 address (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
      if (clientIp.startsWith('::ffff:')) {
        clientIp = clientIp.substring(7);
      }

      const userAgent = req.headers['user-agent'] || 'Unknown';
      const path = req.originalUrl || req.baseUrl + req.path;

      // Extract targetProjectId if assigned by route/controller or params
      let targetProjectId = null;
      if (req.targetProjectId && !isNaN(Number(req.targetProjectId))) {
        targetProjectId = Number(req.targetProjectId);
      } else if (req.params?.id && !isNaN(Number(req.params.id))) {
        targetProjectId = Number(req.params.id);
      }

      // Persist log entry asynchronously in MongoDB
      // Only log API routes (especially /api/projects, /api/showcase, etc.)
      if (path.startsWith('/api') && !path.startsWith('/api/analytics') && !path.includes('/health')) {
        await AccessLog.create({
          timestamp: new Date(),
          path,
          targetProjectId,
          ipAddress: clientIp,
          userAgent: userAgent.substring(0, 500),
          responseTimeMs,
        });
      }
    } catch (err) {
      // Do not crash the server on audit log failure
      console.error('[AuditLogger] Error logging access footprint:', err.message);
    }
  });

  next();
};

module.exports = auditLogger;
