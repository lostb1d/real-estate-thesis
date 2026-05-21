from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from .models import LayerCategory, SpatialLayer, LayerAttribute, SpatialFeature, FeatureAttributeValue, RasterLayer, LayerUpload
from .serializers import SpatialLayerSerializer, LayerAttributeSerializer
from .models import (
    LayerCategory,
    SpatialLayer,
    LayerAttribute,
    SpatialFeature,
    FeatureAttributeValue,
    RasterLayer,
    LayerUpload,
)

from .serializers import (
    LayerCategorySerializer,
    SpatialLayerSerializer,
    LayerAttributeSerializer,
    SpatialFeatureSerializer,
    FeatureAttributeValueSerializer,
    RasterLayerSerializer,
    LayerUploadSerializer,
)


class GISPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 200


class BaseAdminGISViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    pagination_class = GISPagination
    filter_backends = [filters.SearchFilter]


class LayerCategoryViewSet(BaseAdminGISViewSet):
    queryset = LayerCategory.objects.all().order_by("name")
    serializer_class = LayerCategorySerializer
    search_fields = ["name", "code", "description"]


class SpatialLayerViewSet(BaseAdminGISViewSet):
    queryset = SpatialLayer.objects.select_related("category").all().order_by("name")
    serializer_class = SpatialLayerSerializer
    search_fields = ["name", "code", "description", "category__name"]


class LayerAttributeViewSet(BaseAdminGISViewSet):
    queryset = LayerAttribute.objects.select_related("layer").all().order_by("layer", "ordering")
    serializer_class = LayerAttributeSerializer
    search_fields = ["name", "code", "layer__name", "field_type"]


class SpatialFeatureViewSet(BaseAdminGISViewSet):
    queryset = SpatialFeature.objects.select_related("layer").all().order_by("-id")
    serializer_class = SpatialFeatureSerializer
    search_fields = ["name", "layer__name"]


class FeatureAttributeValueViewSet(BaseAdminGISViewSet):
    queryset = FeatureAttributeValue.objects.select_related("feature", "attribute").all().order_by("-id")
    serializer_class = FeatureAttributeValueSerializer
    search_fields = ["feature__name", "attribute__name", "attribute__code"]


class RasterLayerViewSet(BaseAdminGISViewSet):
    queryset = RasterLayer.objects.select_related("layer").all().order_by("-id")
    serializer_class = RasterLayerSerializer
    search_fields = ["layer__name", "layer__code"]


class LayerUploadViewSet(BaseAdminGISViewSet):
    queryset = LayerUpload.objects.select_related("layer", "uploaded_by").all().order_by("-uploaded_at")
    serializer_class = LayerUploadSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ["layer__name", "upload_type", "processing_message"]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class CategorySpatialLayersAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, category_id):
        layers = SpatialLayer.objects.filter(
            category_id=category_id
        ).order_by("name")

        serializer = SpatialLayerSerializer(layers, many=True)
        return Response(serializer.data)
    
class LayerSpatialFeaturesAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, layer_id):
        features = SpatialFeature.objects.filter(layer_id=layer_id).order_by("-id")
        serializer = SpatialFeatureSerializer(features, many=True)
        return Response(serializer.data)


class LayerAttributesAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, layer_id):
        attributes = LayerAttribute.objects.filter(layer_id=layer_id).order_by("ordering", "name")
        serializer = LayerAttributeSerializer(attributes, many=True)
        return Response(serializer.data)