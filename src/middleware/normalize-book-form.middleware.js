function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return defaultValue;
}

function parseNullableString(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value).trim();
}

function buildFileUrl(req, filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const uploadsIndex = normalizedPath.indexOf("uploads/");
  const relativePath =
    uploadsIndex >= 0 ? normalizedPath.substring(uploadsIndex) : normalizedPath;

  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");

  return `${protocol}://${host}/${relativePath}`;
}

export function normalizeBookForm(req, res, next) {
  try {
    const body = req.body || {};

    if (req.file) {
      body.cover_image_url = buildFileUrl(req, req.file.path);
    }

    req.body = {
      name: body.name,
      author: body.author,
      category: body.category,
      type: body.type,
      price: body.price,

      malayalam_name: parseNullableString(body.malayalam_name),
      author_malayalam: parseNullableString(body.author_malayalam),
      description: parseNullableString(body.description),
      edition: parseNullableString(body.edition),
      isbn: parseNullableString(body.isbn),
      num_of_pages: parseNullableString(body.num_of_pages),
      publisher: parseNullableString(body.publisher),
      language: parseNullableString(body.language),
      discount: parseNullableString(body.discount),
      status: body.status,
      rank: parseNullableString(body.rank),
      stock: body.stock,
      cover_image_url: parseNullableString(body.cover_image_url),

      best_seller: parseBoolean(body.best_seller, false),
      award_winner: parseBoolean(body.award_winner, false),
      new_arrival: parseBoolean(body.new_arrival, false),
      republication: parseBoolean(body.republication, false),
      highlight: parseBoolean(body.highlight, false),
      unlimited_stock: parseBoolean(body.unlimited_stock, false),
    };

    next();
  } catch (error) {
    next(error);
  }
}
