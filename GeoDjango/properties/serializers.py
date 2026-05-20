from rest_framework import serializers
# from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers

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


class PropertyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyType
        fields = "__all__"


class PropertyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyFeature
        fields = "__all__"


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = "__all__"
        read_only_fields = ("uploaded_at",)


class PropertyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyDocument
        fields = "__all__"
        read_only_fields = ("uploaded_by", "uploaded_at")


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    documents = PropertyDocumentSerializer(many=True, read_only=True)
    owner_email = serializers.CharField(source="owner.email", read_only=True)
    property_type_name = serializers.CharField(source="property_type.name", read_only=True)

    class Meta:
        model = Property
        fields = "__all__"
        read_only_fields = (
            "owner",
            "slug",
            "view_count",
            "verified_by",
            "verified_at",
            "created_at",
            "updated_at",
        )

class PropertyGeoSerializer(serializers.ModelSerializer):
    longitude = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id",
            "title",
            "slug",
            "price",
            "listing_type",
            "status",
            "address",
            "municipality",
            "district",
            "property_type",
            "longitude",
            "latitude",
        )

    def get_longitude(self, obj):
        return obj.location.x if obj.location else None

    def get_latitude(self, obj):
        return obj.location.y if obj.location else None
    
class PropertyInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyInquiry
        fields = "__all__"
        read_only_fields = ("user", "is_read", "created_at")


class FavoritePropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteProperty
        fields = "__all__"
        read_only_fields = ("user", "created_at")


class PropertyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyTransaction
        fields = "__all__"
        read_only_fields = ("created_at",)