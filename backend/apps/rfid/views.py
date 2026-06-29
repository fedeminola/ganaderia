from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .tasks import process_rfid_sync
from apps.locations.models import Location

class RfidSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Receives RFID sync data from the frontend, validates it,
        and triggers a background task for processing.
        """
        action = request.data.get('action')
        location_id = request.data.get('location_id')
        rfid_tags = request.data.get('rfid_tags')
        extra_data = request.data.get('extra_data', {})

        if not action or rfid_tags is None:
            return Response(
                {'error': 'Missing required data: action and rfid_tags'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # location_id is optional ONLY for associate_tag
        if action != 'associate_tag' and not location_id:
            return Response(
                {'error': 'location_id is required for this action'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(rfid_tags, list):
            return Response(
                {'error': 'rfid_tags must be a list of strings'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Security check: Ensure the farm belongs to the user
            farm_id = request.data.get('farm_id')
            if not farm_id:
                 return Response({'error': 'farm_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check farm access
            if not request.user.farms.filter(id=farm_id).exists():
                 return Response({'error': 'No access to this farm'}, status=status.HTTP_403_FORBIDDEN)

            # Validate location if provided
            if location_id:
                location = Location.objects.get(id=location_id, farm_id=farm_id)
        except Location.DoesNotExist:
            return Response(
                {'error': 'Invalid location.'},
                status=status.HTTP_404_NOT_FOUND
            )

        process_rfid_sync.delay(
            user_id=request.user.id,
            farm_id=farm_id,
            action=action,
            location_id=location_id,
            rfid_tags=rfid_tags,
            extra_data=extra_data
        )

        return Response(
            {'message': 'Sync request received and is being processed.'},
            status=status.HTTP_202_ACCEPTED
        )
