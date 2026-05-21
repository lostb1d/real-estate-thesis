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

    class Meta:
        model = SpatialFeature
        fields = "__all__"


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