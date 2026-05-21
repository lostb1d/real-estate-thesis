from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LayerCategoryViewSet,
    SpatialLayerViewSet,
    LayerAttributeViewSet,
    SpatialFeatureViewSet,
    FeatureAttributeValueViewSet,
    RasterLayerViewSet,
    LayerUploadViewSet,
    CategorySpatialLayersAPIView,
    LayerSpatialFeaturesAPIView,
    LayerAttributesAPIView,
)

router = DefaultRouter()

router.register("layer-categories", LayerCategoryViewSet, basename="layer-categories")
router.register("spatial-layers", SpatialLayerViewSet, basename="spatial-layers")
router.register("layer-attributes", LayerAttributeViewSet, basename="layer-attributes")
router.register("spatial-features", SpatialFeatureViewSet, basename="spatial-features")
router.register("feature-attribute-values", FeatureAttributeValueViewSet, basename="feature-attribute-values")
router.register("raster-layers", RasterLayerViewSet, basename="raster-layers")
router.register("layer-uploads", LayerUploadViewSet, basename="layer-uploads")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "layer-categories/<int:category_id>/spatial-layers/",
        CategorySpatialLayersAPIView.as_view(),
        name="category-spatial-layers",
    ),
    path(
    "spatial-layers/<int:layer_id>/features/",
    LayerSpatialFeaturesAPIView.as_view(),
    name="layer-spatial-features",
),
path(
    "spatial-layers/<int:layer_id>/attributes/",
    LayerAttributesAPIView.as_view(),
    name="layer-attributes",
),

    
    path("", include(router.urls)),
]