from fastapi import Request


def get_include_private(request: Request) -> bool:
    """
    Returns True if private records (is_private=True) should be included.
    HTTPS -> include private; HTTP -> exclude private.
    When behind a proxy, trust X-Forwarded-Proto (use uvicorn --proxy-headers).
    """
    scheme = request.headers.get("X-Forwarded-Proto", request.url.scheme)
    return scheme.lower() == "https"
