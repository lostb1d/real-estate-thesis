from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import (
    PropertyType,
    PropertyFeature,
    Property,
    PropertyImage,
    PropertyDocument,
    PropertyInquiry,
    FavoriteProperty,
    PropertyTransaction,
)

from .serializers import (
    PropertyTypeSerializer,
    PropertyFeatureSerializer,
    PropertySerializer,
    PropertyGeoSerializer,
    PropertyImageSerializer,
    PropertyDocumentSerializer,
    PropertyInquirySerializer,
    FavoritePropertySerializer,
    PropertyTransactionSerializer,
)


class PropertyTypeViewSet(viewsets.ModelViewSet):
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer


class PropertyFeatureViewSet(viewsets.ModelViewSet):
    queryset = PropertyFeature.objects.all()
    serializer_class = PropertyFeatureSerializer


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Property.objects.all()

        status_value = self.request.query_params.get("status")
        listing_type = self.request.query_params.get("listing_type")
        property_type = self.request.query_params.get("property_type")
        district = self.request.query_params.get("district")
        municipality = self.request.query_params.get("municipality")

        if status_value:
            queryset = queryset.filter(status=status_value)

        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)

        if property_type:
            queryset = queryset.filter(property_type_id=property_type)

        if district:
            queryset = queryset.filter(district__icontains=district)

        if municipality:
            queryset = queryset.filter(municipality__icontains=municipality)

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=["view_count"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def geojson(self, request):
        queryset = self.get_queryset().filter(status="approved")
        serializer = PropertyGeoSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def approve(self, request, slug=None):
        property_obj = self.get_object()
        property_obj.status = "approved"
        property_obj.verified_by = request.user
        property_obj.verified_at = timezone.now()
        property_obj.save()
        return Response({"message": "Property approved successfully."})

    @action(detail=True, methods=["post"])
    def reject(self, request, slug=None):
        property_obj = self.get_object()
        property_obj.status = "rejected"
        property_obj.save()
        return Response({"message": "Property rejected successfully."})


class PropertyImageViewSet(viewsets.ModelViewSet):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer


class PropertyDocumentViewSet(viewsets.ModelViewSet):
    queryset = PropertyDocument.objects.all()
    serializer_class = PropertyDocumentSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class PropertyInquiryViewSet(viewsets.ModelViewSet):
    queryset = PropertyInquiry.objects.all()
    serializer_class = PropertyInquirySerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


class FavoritePropertyViewSet(viewsets.ModelViewSet):
    queryset = FavoriteProperty.objects.all()
    serializer_class = FavoritePropertySerializer

    def get_queryset(self):
        return FavoriteProperty.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PropertyTransactionViewSet(viewsets.ModelViewSet):
    queryset = PropertyTransaction.objects.all()
    serializer_class = PropertyTransactionSerializer