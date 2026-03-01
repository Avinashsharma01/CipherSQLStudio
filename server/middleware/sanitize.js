// keywords that students should NOT be able to run
const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER',
  'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE',
  'EXEC', 'EXECUTE', 'COPY',
];

function sanitizeQuery(req, res, next) {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query is required and must be a string',
    });
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Query cannot be empty',
    });
  }

  // only allow SELECT
  if (!/^SELECT\b/i.test(trimmed)) {
    return res.status(403).json({
      success: false,
      error: 'Only SELECT queries are allowed',
    });
  }

  // check for blocked keywords
  const upper = trimmed.toUpperCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    const pattern = new RegExp('\\b' + keyword + '\\b', 'i');
    if (pattern.test(upper)) {
      return res.status(403).json({
        success: false,
        error: `Queries containing "${keyword}" are not allowed.`,
      });
    }
  }

  // dont allow multiple statements (semicolon chaining)
  if (trimmed.includes(';')) {
    const withoutTrailing = trimmed.replace(/;\s*$/, '');
    if (withoutTrailing.includes(';')) {
      return res.status(403).json({
        success: false,
        error: 'Multiple SQL statements are not allowed',
      });
    }
  }

  req.cleanQuery = trimmed.replace(/;\s*$/, '');
  next();
}

module.exports = sanitizeQuery;
