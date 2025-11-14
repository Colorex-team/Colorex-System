export function getAuthCookie(req: any) {
  const cookieToken = req.cookies?.accessToken;

  const headerToken = req.headers?.authorization
    ? req.headers.authorization.split(' ')[1]
    : null;

  return cookieToken || headerToken || null;
}
