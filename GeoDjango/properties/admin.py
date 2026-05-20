from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin

from .models import (
    PropertyType,
    PropertyFeature,
    PropertyFeatureValue,
    Property,
    PropertyImage,
    Parcel,
    PropertyDocument,
    PropertyInquiry,
    FavoriteProperty,
    PropertyTransaction,
)


class PropertyFeatureInline(admin.TabularInline):
    model = PropertyFeature
    extra = 1
    prepopulated_fields = {"code": ("name",)}


@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active",)
    prepopulated_fields = {"code": ("name",)}
    inlines = [PropertyFeatureInline]


@admin.register(PropertyFeature)
class PropertyFeatureAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "property_type",
        "name",
        "code",
        "field_type",
        "unit",
        "is_required",
        "is_filterable",
        "ordering",
    )
    list_filter = ("property_type", "field_type", "is_required", "is_filterable")
    search_fields = ("name", "code", "property_type__name")
    prepopulated_fields = {"code": ("name",)}
    ordering = ("property_type", "ordering", "name")


class PropertyFeatureValueInline(admin.TabularInline):
    model = PropertyFeatureValue
    extra = 1
    fields = (
        "feature",
        "value_text",
        "value_number",
        "value_decimal",
        "value_boolean",
    )


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    readonly_fields = ("uploaded_at",)


class ParcelInline(admin.TabularInline):
    model = Parcel
    extra = 1
    fields = (
        "address_node",
        "parcel_no",
        "sheet_no",
        "map_no",
        "land_area",
        "land_area_unit",
        "boundary",
        "centroid",
        "is_active",
    )
    readonly_fields = ("centroid",)


class PropertyDocumentInline(admin.TabularInline):
    model = PropertyDocument
    extra = 1
    readonly_fields = ("uploaded_at",)


@admin.register(Property)
class PropertyAdmin(GISModelAdmin):
    list_display = (
        "id",
        "title",
        "owner",
        "property_type",
        "listing_type",
        "status",
        "price",
        "municipality",
        "district",
        "is_featured",
        "created_at",
    )

    list_filter = (
        "status",
        "listing_type",
        "property_type",
        "is_featured",
        "district",
        "municipality",
    )

    search_fields = (
        "title",
        "slug",
        "address",
        "municipality",
        "district",
        "province",
        "owner__email",
        "owner__username",
    )

    readonly_fields = (
        "view_count",
        "verified_at",
        "created_at",
        "updated_at",
    )

    prepopulated_fields = {"slug": ("title",)}

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "owner",
                "property_type",
                "title",
                "slug",
                "description",
                "listing_type",
                "status",
            )
        }),
        ("Price Information", {
            "fields": (
                "price",
                "negotiable",
            )
        }),
        ("Area and Road Access", {
            "fields": (
                "land_area",
                "land_area_unit",
                "road_access_width",
                "road_access_unit",
            )
        }),
        ("Address Information", {
            "fields": (
                "address",
                "ward_no",
                "municipality",
                "district",
                "province",
            )
        }),
        ("Spatial Information", {
            "fields": (
                "location",
                "boundary",
            )
        }),
        ("Verification and Status", {
            "fields": (
                "is_featured",
                "view_count",
                "verified_by",
                "verified_at",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )

    inlines = [
        ParcelInline,
        PropertyFeatureValueInline,
        PropertyImageInline,
        PropertyDocumentInline,
    ]


@admin.register(Parcel)
class ParcelAdmin(GISModelAdmin):
    list_display = (
        "id",
        "property",
        "parcel_no",
        "sheet_no",
        "map_no",
        "address_node",
        "land_area",
        "land_area_unit",
        "is_active",
    )

    list_filter = (
        "is_active",
        "address_node__level",
    )

    search_fields = (
        "parcel_no",
        "sheet_no",
        "map_no",
        "property__title",
        "address_node__name",
    )

    readonly_fields = ("centroid",)

    fieldsets = (
        ("Linked Property", {
            "fields": (
                "property",
            )
        }),
        ("Parcel Information", {
            "fields": (
                "address_node",
                "parcel_no",
                "sheet_no",
                "map_no",
                "land_area",
                "land_area_unit",
            )
        }),
        ("Spatial Information", {
            "fields": (
                "boundary",
                "centroid",
            )
        }),
        ("Status", {
            "fields": (
                "is_active",
            )
        }),
    )


@admin.register(PropertyFeatureValue)
class PropertyFeatureValueAdmin(admin.ModelAdmin):
    list_display = ("id", "property", "feature", "get_value")
    list_filter = ("feature__property_type", "feature__field_type")
    search_fields = ("property__title", "feature__name", "feature__code")

    def get_value(self, obj):
        if obj.value_text is not None:
            return obj.value_text
        if obj.value_number is not None:
            return obj.value_number
        if obj.value_decimal is not None:
            return obj.value_decimal
        if obj.value_boolean is not None:
            return obj.value_boolean
        return "-"

    get_value.short_description = "Value"


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ("id", "property", "caption", "is_primary", "uploaded_at")
    list_filter = ("is_primary",)
    search_fields = ("property__title", "caption")


@admin.register(PropertyDocument)
class PropertyDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "property",
        "document_type",
        "title",
        "uploaded_by",
        "uploaded_at",
    )
    list_filter = ("document_type",)
    search_fields = ("property__title", "title", "uploaded_by__email")


@admin.register(PropertyInquiry)
class PropertyInquiryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "property",
        "name",
        "phone",
        "email",
        "is_read",
        "created_at",
    )
    list_filter = ("is_read",)
    search_fields = ("property__title", "name", "phone", "email")


@admin.register(FavoriteProperty)
class FavoritePropertyAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "property", "created_at")
    search_fields = ("user__email", "property__title")


@admin.register(PropertyTransaction)
class PropertyTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "property",
        "transaction_type",
        "transaction_price",
        "buyer_or_renter",
        "transaction_date",
        "created_at",
    )
    list_filter = ("transaction_type", "transaction_date")
    search_fields = ("property__title", "buyer_or_renter__email")