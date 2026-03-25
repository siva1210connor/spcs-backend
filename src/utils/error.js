

 export function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) {
    console.error("SERVICE ERROR:", {
      code,
      message,
      cause,
    });
  }

  return err;
}

export default makeError;
