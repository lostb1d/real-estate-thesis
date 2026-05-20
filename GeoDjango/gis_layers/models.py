from django.db import models
from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.utils.text import slugify
from django.utils import timezone


class LayerCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SpatialLayer(models.Model):
    LAYER_TYPE_CHOICES = (
        ("vector", "Vector"),
        ("raster", "Raster"),
    )

    GEOMETRY_TYPE_CHOICES = (
        ("point", "Point"),
        ("linestring", "LineString"),
        ("polygon", "Polygon"),
        ("multipolygon", "MultiPolygon"),
        ("none", "None / Raster"),
    )

    SOURCE_TYPE_CHOICES = (
        ("manual", "Manual"),
        ("geojson", "GeoJSON"),
        ("shapefile", "Shapefile"),
        ("geotiff", "GeoTIFF"),
        ("wms", "WMS"),
        ("wfs", "WFS"),
        ("geoserver", "GeoServer"),
        ("external_api", "External API"),
    )

    category = models.ForeignKey(
        LayerCategory,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="layers"
    )

    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=180, unique=True, blank=True)

    layer_type = models.CharField(max_length=20, choices=LAYER_TYPE_CHOICES)
    geometry_type = models.CharField(
        max_length=30,
        choices=GEOMETRY_TYPE_CHOICES,
        default="none"
    )

    source_type = models.CharField(
        max_length=30,
        choices=SOURCE_TYPE_CHOICES,
        default="manual"
    )

    description = models.TextField(blank=True, null=True)

    geoserver_workspace = models.CharField(max_length=100, blank=True, null=True)
    geoserver_layer_name = models.CharField(max_length=150, blank=True, null=True)

    wms_url = models.URLField(blank=True, null=True)
    wfs_url = models.URLField(blank=True, null=True)

    style_name = models.CharField(max_length=100, blank=True, null=True)

    is_visible = models.BooleanField(default=True)
    is_queryable = models.BooleanField(default=True)
    is_editable = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="created_spatial_layers"
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "name"]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class LayerAttribute(models.Model):
    FIELD_TYPE_CHOICES = (
        ("text", "Text"),
        ("integer", "Integer"),
        ("decimal", "Decimal"),
        ("boolean", "Boolean"),
        ("date", "Date"),
        ("datetime", "DateTime"),
        ("choice", "Choice"),
    )

    layer = models.ForeignKey(
        SpatialLayer,
        on_delete=models.CASCADE,
        related_name="attributes"
    )

    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=120, blank=True)

    field_type = models.CharField(max_length=30, choices=FIELD_TYPE_CHOICES)

    choices = models.JSONField(
        blank=True,
        null=True,
        help_text='For choice field. Example: ["High", "Medium", "Low"]'
    )

    unit = models.CharField(max_length=50, blank=True, null=True)
    default_value = models.CharField(max_length=255, blank=True, null=True)

    is_required = models.BooleanField(default=False)
    is_filterable = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)

    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("layer", "code")
        ordering = ["layer", "ordering", "name"]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.layer.name} - {self.name}"


class SpatialFeature(models.Model):
    layer = models.ForeignKey(
        SpatialLayer,
        on_delete=models.CASCADE,
        related_name="features"
    )

    name = models.CharField(max_length=150, blank=True, null=True)

    point = gis_models.PointField(
        geography=True,
        srid=4326,
        blank=True,
        null=True
    )

    line = gis_models.LineStringField(
        geography=True,
        srid=4326,
        blank=True,
        null=True
    )

    polygon = gis_models.PolygonField(
        geography=True,
        srid=4326,
        blank=True,
        null=True
    )

    multipolygon = gis_models.MultiPolygonField(
        geography=True,
        srid=4326,
        blank=True,
        null=True
    )

    properties = models.JSONField(
        blank=True,
        null=True,
        help_text="Stores dynamic attribute values as JSON"
    )

    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="created_spatial_features"
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["layer", "name"]

    def __str__(self):
        return self.name or f"Feature {self.id}"


class FeatureAttributeValue(models.Model):
    feature = models.ForeignKey(
        SpatialFeature,
        on_delete=models.CASCADE,
        related_name="attribute_values"
    )

    attribute = models.ForeignKey(
        LayerAttribute,
        on_delete=models.CASCADE,
        related_name="values"
    )

    value_text = models.TextField(blank=True, null=True)
    value_integer = models.IntegerField(blank=True, null=True)
    value_decimal = models.DecimalField(max_digits=14, decimal_places=4, blank=True, null=True)
    value_boolean = models.BooleanField(blank=True, null=True)
    value_date = models.DateField(blank=True, null=True)
    value_datetime = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("feature", "attribute")

    def __str__(self):
        return f"{self.feature} - {self.attribute.name}"


class RasterLayer(models.Model):
    layer = models.OneToOneField(
        SpatialLayer,
        on_delete=models.CASCADE,
        related_name="raster_detail"
    )

    raster_file = models.FileField(
        upload_to="gis_layers/rasters/",
        blank=True,
        null=True
    )

    min_value = models.DecimalField(max_digits=14, decimal_places=4, blank=True, null=True)
    max_value = models.DecimalField(max_digits=14, decimal_places=4, blank=True, null=True)

    pixel_size = models.DecimalField(max_digits=12, decimal_places=4, blank=True, null=True)
    no_data_value = models.CharField(max_length=50, blank=True, null=True)

    srid = models.PositiveIntegerField(default=4326)

    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Raster - {self.layer.name}"


class LayerUpload(models.Model):
    UPLOAD_TYPE_CHOICES = (
        ("geojson", "GeoJSON"),
        ("shapefile", "Shapefile"),
        ("geotiff", "GeoTIFF"),
        ("csv", "CSV"),
    )

    layer = models.ForeignKey(
        SpatialLayer,
        on_delete=models.CASCADE,
        related_name="uploads"
    )

    upload_type = models.CharField(max_length=30, choices=UPLOAD_TYPE_CHOICES)

    file = models.FileField(upload_to="gis_layers/uploads/")

    name_field = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Feature name field from uploaded data"
    )

    processed = models.BooleanField(default=False)
    processing_message = models.TextField(blank=True, null=True)

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.layer.name} - {self.upload_type}"