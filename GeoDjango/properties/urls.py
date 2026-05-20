from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PropertyTypeViewSet,
    PropertyFeatureViewSet,
    PropertyViewSet,
    PropertyImageViewSet,
    PropertyDocumentViewSet,
    PropertyInquiryViewSet,
    FavoritePropertyViewSet,
    PropertyTransactionViewSet,
)

router = DefaultRouter()

router.register("property-types", PropertyTypeViewSet)
router.register("property-features", PropertyFeatureViewSet)
router.register("properties", PropertyViewSet)
router.register("property-images", PropertyImageViewSet)
router.register("property-documents", PropertyDocumentViewSet)
router.register("property-inquiries", PropertyInquiryViewSet)
router.register("favorite-properties", FavoritePropertyViewSet)
router.register("property-transactions", PropertyTransactionViewSet)

urlpatterns = [
    path("", include(router.urls)),
]