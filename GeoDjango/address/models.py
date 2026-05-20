from django.db import models
from django.utils.text import slugify
from django.contrib.gis.db import models as gis_models


class AddressLevel(models.Model):
    name = models.CharField(max_length=100)  # Country, Province, District, Ward
    code = models.SlugField(max_length=120, unique=True, blank=True)
    order = models.PositiveIntegerField()
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="children"
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class AddressNode(models.Model):
    level = models.ForeignKey(
        AddressLevel,
        on_delete=models.CASCADE,
        related_name="nodes"
    )

    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="children"
    )

    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=180, blank=True)

    boundary = gis_models.MultiPolygonField(
        geography=True,
        srid=4326,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("parent", "level", "code")
        ordering = ["level__order", "name"]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        super().save(*args, **kwargs)

    def get_full_name(self):
        parts = [self.name]
        parent = self.parent

        while parent:
            parts.append(parent.name)
            parent = parent.parent

        return ", ".join(reversed(parts))

    def __str__(self):
        return self.get_full_name()


class Address(models.Model):
    address_node = models.ForeignKey(
        AddressNode,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="addresses"
    )

    street_address = models.CharField(max_length=255, blank=True, null=True)
    house_no = models.CharField(max_length=50, blank=True, null=True)
    postal_code = models.CharField(max_length=30, blank=True, null=True)

    location = gis_models.PointField(
        geography=True,
        srid=4326,
        blank=True,
        null=True
    )

    formatted_address = models.TextField(blank=True, null=True)

    def build_formatted_address(self):
        parts = []

        if self.house_no:
            parts.append(self.house_no)

        if self.street_address:
            parts.append(self.street_address)

        if self.address_node:
            parts.append(self.address_node.get_full_name())

        if self.postal_code:
            parts.append(self.postal_code)

        return ", ".join(parts)

    def save(self, *args, **kwargs):
        self.formatted_address = self.build_formatted_address()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.formatted_address or "Address"
    
class AddressGeoJSONUpload(models.Model):
    level = models.ForeignKey(
        AddressLevel,
        on_delete=models.CASCADE,
        related_name="geojson_uploads"
    )

    parent = models.ForeignKey(
        AddressNode,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="geojson_child_uploads",
        help_text="Select parent node. Example: Nepal for Province upload, Province for District upload."
    )

    file = models.FileField(upload_to="addresses/geojson/")
    name_property = models.CharField(
        max_length=100,
        default="name",
        help_text="GeoJSON property key containing address name. Example: name, DISTRICT, province"
    )

    code_property = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Optional GeoJSON property key containing code"
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.level.name} GeoJSON Upload"