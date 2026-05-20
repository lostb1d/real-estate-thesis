import json

from django.contrib import admin, messages
from django.contrib.gis.admin import GISModelAdmin
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon, Polygon
from django.utils.text import slugify

from .models import (
    AddressLevel,
    AddressNode,
    Address,
    AddressGeoJSONUpload,
)


class AddressNodeInline(admin.TabularInline):
    model = AddressNode
    fk_name = "parent"
    extra = 1
    fields = ("level", "name", "code", "is_active")
    prepopulated_fields = {"code": ("name",)}


@admin.register(AddressLevel)
class AddressLevelAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "code")
    ordering = ("order", "name")
    prepopulated_fields = {"code": ("name",)}


@admin.register(AddressNode)
class AddressNodeAdmin(GISModelAdmin):
    list_display = ("id", "name", "level", "parent", "get_full_address", "is_active")
    list_filter = ("level", "is_active")
    search_fields = ("name", "code", "parent__name")
    ordering = ("level__order", "name")
    prepopulated_fields = {"code": ("name",)}
    inlines = [AddressNodeInline]
    readonly_fields = ("get_full_address",)

    fieldsets = (
        ("Basic Information", {
            "fields": ("level", "parent", "name", "code", "is_active")
        }),
        ("Spatial Boundary", {
            "fields": ("boundary",)
        }),
        ("Computed Information", {
            "fields": ("get_full_address",)
        }),
    )

    def get_full_address(self, obj):
        return obj.get_full_name()

    get_full_address.short_description = "Full Address"


@admin.register(Address)
class AddressAdmin(GISModelAdmin):
    list_display = (
        "id",
        "address_node",
        "street_address",
        "house_no",
        "postal_code",
        "formatted_address",
    )

    list_filter = ("address_node__level",)

    search_fields = (
        "street_address",
        "house_no",
        "postal_code",
        "formatted_address",
        "address_node__name",
    )

    readonly_fields = ("formatted_address",)

    fieldsets = (
        ("Address Hierarchy", {
            "fields": ("address_node",)
        }),
        ("Street Details", {
            "fields": ("house_no", "street_address", "postal_code")
        }),
        ("Location", {
            "fields": ("location",)
        }),
        ("Formatted Output", {
            "fields": ("formatted_address",)
        }),
    )


@admin.register(AddressGeoJSONUpload)
class AddressGeoJSONUploadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "level",
        "parent",
        "file",
        "name_property",
        "processed",
        "uploaded_at",
    )

    list_filter = ("level", "processed", "uploaded_at")
    search_fields = ("level__name", "parent__name", "name_property")
    readonly_fields = ("uploaded_at", "processed")

    fieldsets = (
        ("Upload Settings", {
            "fields": (
                "level",
                "parent",
                "file",
                "name_property",
                "code_property",
            )
        }),
        ("Status", {
            "fields": (
                "processed",
                "uploaded_at",
            )
        }),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        if obj.processed:
            messages.warning(request, "This GeoJSON file has already been processed.")
            return

        try:
            self.process_geojson(obj)
            obj.processed = True
            obj.save(update_fields=["processed"])
            messages.success(request, "GeoJSON uploaded and address nodes created successfully.")
        except Exception as e:
            messages.error(request, f"GeoJSON processing failed: {str(e)}")

    def process_geojson(self, upload_obj):
        with upload_obj.file.open("r") as f:
            data = json.load(f)

        hierarchy = [
            ("country", "Country", 1),
            ("province", "Province", 2),
            ("district", "District", 3),
            ("municipality", "Municipality", 4),
            ("ward", "Ward", 5),
        ]

        features = data.get("features", [])

        for feature in features:
            props = feature.get("properties", {})
            geometry = feature.get("geometry")

            parent_node = None

            for prop_key, level_name, order in hierarchy:
                node_name = props.get(prop_key)

                if not node_name:
                    continue

                level, _ = AddressLevel.objects.get_or_create(
                    code=slugify(level_name),
                    defaults={
                        "name": level_name,
                        "order": order,
                        "is_active": True,
                    }
                )

                node_code = slugify(str(node_name))

                boundary = None

                # store geometry only on the lowest level, usually Ward
                if prop_key == "ward" and geometry:
                    geom = GEOSGeometry(json.dumps(geometry), srid=4326)

                    if isinstance(geom, Polygon):
                        geom = MultiPolygon(geom)

                    boundary = geom

                node, _ = AddressNode.objects.update_or_create(
                    level=level,
                    parent=parent_node,
                    code=node_code,
                    defaults={
                        "name": node_name,
                        "is_active": True,
                    }
                )

                if boundary:
                    node.boundary = boundary
                    node.save(update_fields=["boundary"])

                parent_node = node