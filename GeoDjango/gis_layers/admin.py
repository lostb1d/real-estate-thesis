from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin

import json

from django.contrib import messages
from django.contrib.gis.geos import GEOSGeometry, Point, LineString, Polygon, MultiPolygon

from .models import (
    LayerCategory,
    SpatialLayer,
    LayerAttribute,
    SpatialFeature,
    FeatureAttributeValue,
    RasterLayer,
    LayerUpload,
)


# =========================================================
# Layer Configuration
# =========================================================

class LayerAttributeInline(admin.TabularInline):
    model = LayerAttribute
    extra = 1

    fields = (
        "name",
        "code",
        "field_type",
        "choices",
        "unit",
        "default_value",
        "is_required",
        "is_filterable",
        "is_visible",
        "ordering",
    )

    prepopulated_fields = {
        "code": ("name",)
    }


class RasterLayerInline(admin.StackedInline):
    model = RasterLayer
    extra = 0
    max_num = 1


@admin.register(LayerCategory)
class LayerCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "code",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "code",
    )

    prepopulated_fields = {
        "code": ("name",)
    }


@admin.register(SpatialLayer)
class SpatialLayerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "layer_type",
        "geometry_type",
        "source_type",
        "is_visible",
        "is_queryable",
        "is_editable",
        "is_active",
    )

    list_filter = (
        "category",
        "layer_type",
        "geometry_type",
        "source_type",
        "is_visible",
        "is_queryable",
        "is_editable",
        "is_active",
    )

    search_fields = (
        "name",
        "code",
        "description",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    prepopulated_fields = {
        "code": ("name",)
    }

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "category",
                "name",
                "code",
                "description",
            )
        }),

        ("Layer Type", {
            "fields": (
                "layer_type",
                "geometry_type",
                "source_type",
            )
        }),

        ("GeoServer / Service Configuration", {
            "fields": (
                "geoserver_workspace",
                "geoserver_layer_name",
                "wms_url",
                "wfs_url",
                "style_name",
            )
        }),

        ("Permissions and Visibility", {
            "fields": (
                "is_visible",
                "is_queryable",
                "is_editable",
                "is_active",
            )
        }),

        ("Audit Information", {
            "fields": (
                "created_by",
                "created_at",
                "updated_at",
            )
        }),
    )

    inlines = [
        LayerAttributeInline,
        RasterLayerInline,
    ]

    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user

        super().save_model(request, obj, form, change)


@admin.register(LayerAttribute)
class LayerAttributeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "layer",
        "name",
        "code",
        "field_type",
        "unit",
        "is_required",
        "is_filterable",
        "is_visible",
        "ordering",
    )

    list_filter = (
        "layer",
        "field_type",
        "is_required",
        "is_filterable",
        "is_visible",
    )

    search_fields = (
        "name",
        "code",
        "layer__name",
    )

    ordering = (
        "layer",
        "ordering",
        "name",
    )

    prepopulated_fields = {
        "code": ("name",)
    }


# =========================================================
# Spatial Features
# =========================================================

class FeatureAttributeValueInline(admin.TabularInline):
    model = FeatureAttributeValue
    extra = 1

    fields = (
        "attribute",
        "value_text",
        "value_integer",
        "value_decimal",
        "value_boolean",
        "value_date",
        "value_datetime",
    )


@admin.register(SpatialFeature)
class SpatialFeatureAdmin(GISModelAdmin):
    list_display = (
        "id",
        "name",
        "layer",
        "get_geometry_type",
        "is_active",
        "created_at",
    )

    list_filter = (
        "layer",
        "layer__layer_type",
        "layer__geometry_type",
        "is_active",
    )

    search_fields = (
        "name",
        "layer__name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "layer",
                "name",
                "is_active",
            )
        }),

        ("Geometry", {
            "fields": (
                "point",
                "line",
                "polygon",
                "multipolygon",
            )
        }),

        ("Dynamic Properties", {
            "fields": (
                "properties",
            )
        }),

        ("Audit Information", {
            "fields": (
                "created_by",
                "created_at",
                "updated_at",
            )
        }),
    )

    inlines = [
        FeatureAttributeValueInline,
    ]

    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user

        super().save_model(request, obj, form, change)

    def get_geometry_type(self, obj):
        if obj.point:
            return "Point"

        if obj.line:
            return "LineString"

        if obj.polygon:
            return "Polygon"

        if obj.multipolygon:
            return "MultiPolygon"

        return "-"

    get_geometry_type.short_description = "Geometry Type"


@admin.register(FeatureAttributeValue)
class FeatureAttributeValueAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "feature",
        "attribute",
        "get_value",
    )

    list_filter = (
        "attribute__layer",
        "attribute__field_type",
    )

    search_fields = (
        "feature__name",
        "attribute__name",
        "attribute__code",
    )

    def get_value(self, obj):
        if obj.value_text is not None:
            return obj.value_text

        if obj.value_integer is not None:
            return obj.value_integer

        if obj.value_decimal is not None:
            return obj.value_decimal

        if obj.value_boolean is not None:
            return obj.value_boolean

        if obj.value_date is not None:
            return obj.value_date

        if obj.value_datetime is not None:
            return obj.value_datetime

        return "-"

    get_value.short_description = "Value"


@admin.register(RasterLayer)
class RasterLayerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "layer",
        "raster_file",
        "min_value",
        "max_value",
        "pixel_size",
        "srid",
        "uploaded_at",
    )

    search_fields = (
        "layer__name",
        "layer__code",
    )

    readonly_fields = (
        "uploaded_at",
    )


# =========================================================
# Uploads
# =========================================================

@admin.register(LayerUpload)
class LayerUploadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "layer",
        "upload_type",
        "processed",
        "uploaded_by",
        "uploaded_at",
    )

    list_filter = (
        "layer",
        "upload_type",
        "processed",
        "uploaded_at",
    )

    search_fields = (
        "layer__name",
        "processing_message",
    )

    readonly_fields = (
        "processed",
        "processing_message",
        "uploaded_at",
    )

    fieldsets = (
        ("Upload Information", {
            "fields": (
                "layer",
                "upload_type",
                "file",
                "name_field",
            )
        }),
        ("Processing Status", {
            "fields": (
                "processed",
                "processing_message",
            )
        }),
        ("Audit Information", {
            "fields": (
                "uploaded_by",
                "uploaded_at",
            )
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user

        super().save_model(request, obj, form, change)

        if obj.upload_type == "geojson" and not obj.processed:
            try:
                created_count = self.process_geojson(obj, request)
                obj.processed = True
                obj.processing_message = f"GeoJSON processed successfully. {created_count} features created."
                obj.save(update_fields=["processed", "processing_message"])

                messages.success(
                    request,
                    f"GeoJSON processed successfully. {created_count} features created."
                )

            except Exception as e:
                obj.processing_message = str(e)
                obj.save(update_fields=["processing_message"])

                messages.error(
                    request,
                    f"GeoJSON processing failed: {str(e)}"
                )

    def process_geojson(self, upload_obj, request):
        with upload_obj.file.open("r") as f:
            data = json.load(f)

        if data.get("type") != "FeatureCollection":
            raise ValueError("Invalid GeoJSON. Expected FeatureCollection.")

        features = data.get("features", [])

        if not features:
            raise ValueError("GeoJSON contains no features.")

        created_count = 0

        for feature in features:
            geometry = feature.get("geometry")
            properties = feature.get("properties", {})

            if not geometry:
                continue

            geom = GEOSGeometry(json.dumps(geometry), srid=4326)

            feature_name = None

            if upload_obj.name_field:
                feature_name = properties.get(upload_obj.name_field)

            if not feature_name:
                feature_name = (
                    properties.get("name")
                    or properties.get("Name")
                    or properties.get("NAME")
                    or f"Feature {created_count + 1}"
                )

            spatial_feature = SpatialFeature(
                layer=upload_obj.layer,
                name=feature_name,
                properties=properties,
                created_by=request.user,
                is_active=True,
            )

            if isinstance(geom, Point):
                spatial_feature.point = geom

            elif isinstance(geom, LineString):
                spatial_feature.line = geom

            elif isinstance(geom, Polygon):
                spatial_feature.polygon = geom

            elif isinstance(geom, MultiPolygon):
                spatial_feature.multipolygon = geom

            else:
                continue

            spatial_feature.save()
            self.create_attribute_values(spatial_feature, properties)

            created_count += 1

        return created_count

    def create_attribute_values(self, spatial_feature, properties):
        attributes = spatial_feature.layer.attributes.all()

        for attribute in attributes:
            value = properties.get(attribute.code)

            if value is None:
                value = properties.get(attribute.name)

            if value is None:
                value = attribute.default_value

            if value is None:
                continue

            attr_value = FeatureAttributeValue(
                feature=spatial_feature,
                attribute=attribute,
            )

            if attribute.field_type in ["text", "choice"]:
                attr_value.value_text = str(value)

            elif attribute.field_type == "integer":
                try:
                    attr_value.value_integer = int(value)
                except Exception:
                    attr_value.value_text = str(value)

            elif attribute.field_type == "decimal":
                try:
                    attr_value.value_decimal = value
                except Exception:
                    attr_value.value_text = str(value)

            elif attribute.field_type == "boolean":
                if str(value).lower() in ["true", "1", "yes"]:
                    attr_value.value_boolean = True
                elif str(value).lower() in ["false", "0", "no"]:
                    attr_value.value_boolean = False
                else:
                    attr_value.value_text = str(value)

            attr_value.save()