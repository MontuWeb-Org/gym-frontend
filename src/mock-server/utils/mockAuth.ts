export function getTrainerIdFromRequest(
  request: Request
): number | null {
  const authHeader =
    request.headers.get("Authorization");

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return null;
  }

  const token =
    authHeader
      .replace("Bearer ", "")
      .trim();

  const parts = token.split("_");

  if (
    parts.length >= 4 &&
    /^\d+$/.test(parts[2])
  ) {
    return Number(parts[2]);
  }

  return null;
}