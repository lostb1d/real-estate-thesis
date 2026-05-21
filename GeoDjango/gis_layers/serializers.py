from rest_framework import serializers
from .models import (
    LayerCategory,
    SpatialLayer,
    LayerAttribute,
    SpatialFeature,
    FeatureAttributeValue,
    RasterLayer,
    LayerUpload,
)
import json
from django.contrib.gis.geos import GEOSGeometry
from rest_framework import serializers

from .models import SpatialFeature

class LayerCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LayerCategory
        fields = "__all__"


class SpatialLayerSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = SpatialLayer
        fields = "__all__"


class LayerAttributeSerializer(serializers.ModelSerializer):
    layer_name = serializers.CharField(source="layer.name", read_only=True)

    class Meta:
        model = LayerAttribute
        fields = "__all__"


class SpatialFeatureSerializer(serializers.ModelSerializer):
    layer_name = serializers.CharField(source="layer.name", read_only=True)

    point = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    line = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    polygon = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    multipolygon = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = SpatialFeature
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_at")

    def validate_geometry(self, value):
        if not value:
            return None
        return GEOSGeometry(value, srid=4326)

    def create(self, validated_data):
        for field in ["point", "line", "polygon", "multipolygon"]:
            if field in validated_data:
                validated_data[field] = self.validate_geometry(validated_data[field])

        request = self.context.get("request")
        if request:
            validated_data["created_by"] = request.user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        for field in ["point", "line", "polygon", "multipolygon"]:
            if field in validated_data:
                validated_data[field] = self.validate_geometry(validated_data[field])

        return super().update(instance, validated_data)


class FeatureAttributeValueSerializer(serializers.ModelSerializer):
    feature_name = serializers.CharField(source="feature.name", read_only=True)
    attribute_name = serializers.CharField(source="attribute.name", read_only=True)

    class Meta:
        model = FeatureAttributeValue
        fields = "__all__"


class RasterLayerSerializer(serializers.ModelSerializer):
    layer_name = serializers.CharField(source="layer.name", read_only=True)

    class Meta:
        model = RasterLayer
        fields = "__all__"


class LayerUploadSerializer(serializers.ModelSerializer):
    layer_name = serializers.CharField(source="layer.name", read_only=True)

    class Meta:
        model = LayerUpload
        fields = "__all__"
        read_only_fields = ("uploaded_by", "processed", "processing_message", "uploaded_at")