export const ok = (res, data = {}, message = "") =>
  res.status(200).json({ success: true, data, message });

export const created = (res, data = {}, message = "") =>
  res.status(201).json({ success: true, data, message });