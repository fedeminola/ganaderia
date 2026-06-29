from celery import shared_task
from django.db import transaction
from apps.accounts.models import User
from apps.farms.models import Farm
from apps.locations.models import Location
from apps.animals.models import Animal, AnimalEvent, MissingAlert
from apps.health.models import Treatment, Vaccine
import datetime
from django.utils import timezone

@shared_task
def process_rfid_sync(user_id, farm_id, action, location_id, rfid_tags, extra_data=None):
    """
    Processes the RFID sync data in the background.
    """
    if extra_data is None:
        extra_data = {}
    try:
        user = User.objects.get(id=user_id)
        farm = Farm.objects.get(id=farm_id)
        # Adjust for 'associate_tag' action which might not have a location
        location = None
        if location_id:
            location = Location.objects.get(id=location_id)

        with transaction.atomic():
            animals = Animal.objects.filter(farm=farm, rfid__in=rfid_tags)
            animal_map = {animal.rfid: animal for animal in animals}

            # For actions other than 'associate_tag', we pre-create new animals if they don't exist
            if action != 'associate_tag':
                new_rfids = set(rfid_tags) - set(animal_map.keys())
                
                if new_rfids:
                    # Get default species and category for the farm if they exist
                    from apps.animals.models import Species, Category
                    default_species = Species.objects.filter(farm=farm).first()
                    default_category = Category.objects.filter(farm=farm, species=default_species).first() if default_species else None

                    new_animals = []
                    for rfid in new_rfids:
                        animal = Animal(
                            farm=farm,
                            rfid=rfid,
                            status=Animal.AnimalStatus.ACTIVE,
                            current_location=location,
                            species=default_species,
                            category=default_category,
                            created_by=user,
                            updated_by=user,
                        )
                        new_animals.append(animal)
                    Animal.objects.bulk_create(new_animals)
                    
                    # Refresh animal_map with new animals
                    newly_created_animals = Animal.objects.filter(farm=farm, rfid__in=new_rfids)
                    for animal in newly_created_animals:
                        animal_map[animal.rfid] = animal


            if action == 'count':
                # Logic for counting animals and detecting missing ones
                expected_animals = Animal.objects.filter(farm=farm, current_location=location, status=Animal.AnimalStatus.ACTIVE)
                scanned_rfids = set(rfid_tags)

                # Animales presentes: Actualizar última vez vistos o crear evento de conteo
                seen_animals = expected_animals.filter(rfid__in=scanned_rfids)
                for animal in seen_animals:
                    AnimalEvent.objects.create(
                        animal=animal,
                        type=AnimalEvent.EventType.COUNT,
                        timestamp=timezone.now(),
                        user=user,
                        metadata={'location_id': str(location.id), 'location_name': location.name}
                    )

                # Mark animals not in the scan as missing
                missing_animals = expected_animals.exclude(rfid__in=scanned_rfids)
                for animal in missing_animals:
                    animal.status = Animal.AnimalStatus.MISSING
                    animal.save()
                    
                    # Create a MissingAlert
                    MissingAlert.objects.create(
                        animal=animal,
                        location=location,
                        detected_at=timezone.now()
                    )

            elif action == 'movement':
                # Logic for moving animals to the new location
                for rfid in rfid_tags:
                    animal = animal_map[rfid]
                    if animal.current_location != location:
                        old_location_id = str(animal.current_location.id) if animal.current_location else None
                        old_location_name = animal.current_location.name if animal.current_location else 'N/A'
                        
                        animal.current_location = location
                        animal.save()
                        
                        AnimalEvent.objects.create(
                            animal=animal,
                            type=AnimalEvent.EventType.MOVEMENT,
                            timestamp=timezone.now(),
                            user=user,
                            metadata={
                                'from_location_id': old_location_id,
                                'from_location_name': old_location_name,
                                'to_location_id': str(location.id),
                                'to_location_name': location.name,
                            }
                        )

            elif action == 'apply_treatment':
                # Logic for applying a health treatment
                treatment_id = extra_data.get('treatment_id')
                vaccine_id = extra_data.get('vaccine_id')
                treatment_name = extra_data.get('treatment') # From new frontend input
                event_type = AnimalEvent.EventType.TREATMENT
                event_metadata = {}

                if vaccine_id:
                    vaccine = Vaccine.objects.get(id=vaccine_id, farm=farm)
                    event_type = AnimalEvent.EventType.VACCINATION
                    event_metadata = {"vaccine_id": str(vaccine.id), "vaccine_name": vaccine.name}
                elif treatment_id:
                    treatment = Treatment.objects.get(id=treatment_id, farm=farm)
                    event_metadata = {"treatment_id": str(treatment.id), "treatment_name": treatment.name}
                elif treatment_name:
                    event_metadata = {"treatment_name": treatment_name}

                for rfid in rfid_tags:
                    animal = animal_map[rfid]
                    AnimalEvent.objects.create(
                        animal=animal,
                        type=event_type,
                        timestamp=timezone.now(),
                        user=user,
                        metadata=event_metadata
                    )

            elif action == 'weighing':
                # Logic for recording weight
                weight = extra_data.get('weight')
                if weight:
                    for rfid in rfid_tags:
                        animal = animal_map[rfid]
                        AnimalEvent.objects.create(
                            animal=animal,
                            type=AnimalEvent.EventType.WEIGHING,
                            timestamp=timezone.now(),
                            user=user,
                            metadata={"weight": weight, "unit": "kg"}
                        )
                        # Optionally update animal's last weight if we had a field for it
            
            elif action == 'associate_tag':
                # Logic for associating an RFID to an existing animal by internal_number
                internal_number = extra_data.get('internal_number')
                if internal_number and rfid_tags:
                    # We take the first tag from the scan for association
                    rfid = rfid_tags[0]
                    animal = Animal.objects.filter(farm=farm, internal_number=internal_number).first()
                    if animal:
                        animal.rfid = rfid
                        animal.save()
                    else:
                        # Create new animal with this rfid and internal number
                        from apps.animals.models import Species, Category
                        default_species = Species.objects.filter(farm=farm).first()
                        default_category = Category.objects.filter(farm=farm, species=default_species).first() if default_species else None
                        Animal.objects.create(
                            farm=farm,
                            rfid=rfid,
                            internal_number=internal_number,
                            status=Animal.AnimalStatus.ACTIVE,
                            species=default_species,
                            category=default_category,
                            created_by=user,
                            updated_by=user,
                        )

    except (User.DoesNotExist, Farm.DoesNotExist, Location.DoesNotExist) as e:
        # Handle errors, maybe log them to a file or a monitoring service
        print(f"Error processing RFID sync: {e}")
    except (Vaccine.DoesNotExist, Treatment.DoesNotExist) as e:
        print(f"Error finding health item: {e}")