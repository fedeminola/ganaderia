import logging

logger = logging.getLogger(__name__)

class DebugHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log all headers for debugging purposes
        logger.info(f"Request path: {request.path}")
        logger.info(f"Request headers: {request.headers}")
        
        response = self.get_response(request)
        
        return response