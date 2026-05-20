from django.db import models
from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.utils import timezone
from django.utils.text import slugify


class PropertyType(models.Model):
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


class PropertyFeature(models.Model):
    FIELD_TYPE_CHOICES = (
        ("text", "Text"),
        ("number", "Number"),
        ("decimal", "Decimal"),
        ("boolean", "Boolean"),
        ("choice", "Choice"),
    )

    property_type = models.ForeignKey(
        PropertyType,
        on_delete=models.CASCADE,
        related_name="features"
    )

    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=120, blank=True)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES)
    unit = models.CharField(max_length=30, blank=True, null=True)

    choices = models.JSONField(
        blank=True,
        null=True,
        help_text='Example: ["North", "South", "East", "West"]'
    )

    is_required = models.BooleanField(default=False)
    is_filterable = models.BooleanField(default=True)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("property_type", "code")
        ordering = ["property_type", "ordering", "name"]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.property_type.name} - {self.name}"


class Property(models.Model):
    LISTING_TYPE_CHOICES = (
        ("sale", "For Sale"),
        ("rent", "For Rent"),
        ("lease", "For Lease"),
    )

    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("pending", "Pending Verification"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("sold", "Sold"),
        ("rented", "Rented"),
        ("inactive", "Inactive"),
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties"
    )

    property_type = models.ForeignKey(
        PropertyType,
        on_delete=models.SET_NULL,
        null=True,
        related_name="properties"
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)

    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE_CHOICES)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="draft")

    price = models.DecimalField(max_digits=14, decimal_places=2)
    negotiable = models.BooleanField(default=False)

    land_area = models.DecimalField(max_digits=12, decimal_places=2)
    land_area_unit = models.CharField(max_length=30, default="sqft")

    address = models.CharField(max_length=255)
    ward_no = models.CharField(max_length=20, blank=True, null=True)
    municipality = models.CharField(max_length=150, blank=True, null=True)
    district = models.CharField(max_length=150, blank=True, null=True)
    province = models.CharField(max_length=150, blank=True, null=True)

    location = gis_models.PointField(
        geography=True,
        srid=4326,
        help_text="Property point location"
    )

    boundary = gis_models.PolygonField(
        geography=True,
        srid=4326,
        blank=True,
        null=True,
        help_text="Optional property parcel boundary"
    )

    road_access_width = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True
    )
    road_access_unit = models.CharField(max_length=20, default="meter")

    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)

    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="verified_properties"
    )
    verified_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["listing_type"]),
            models.Index(fields=["price"]),
            models.Index(fields=["created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while Property.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PropertyFeatureValue(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="feature_values"
    )

    feature = models.ForeignKey(
        PropertyFeature,
        on_delete=models.CASCADE,
        related_name="values"
    )

    value_text = models.TextField(blank=True, null=True)
    value_number = models.IntegerField(blank=True, null=True)
    value_decimal = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    value_boolean = models.BooleanField(blank=True, null=True)

    class Meta:
        unique_together = ("property", "feature")

    def __str__(self):
        return f"{self.property.title} - {self.feature.name}"


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="properties/images/")
    caption = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Image for {self.property.title}"


class Parcel(models.Model):
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.CASCADE,
        related_name="parcels",
        blank=True,
        null=True
    )

    address_node = models.ForeignKey(
        "address.AddressNode",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="parcels"
    )

    parcel_no = models.CharField(max_length=100)
    sheet_no = models.CharField(max_length=100, blank=True, null=True)
    map_no = models.CharField(max_length=100, blank=True, null=True)

    land_area = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    land_area_unit = models.CharField(max_length=30, default="sqft")

    boundary = gis_models.MultiPolygonField(
        geography=True,
        srid=4326,
        blank=True,
        null=True
    )

    centroid = gis_models.PointField(
        geography=True,
        srid=4326,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("property", "parcel_no")

    def save(self, *args, **kwargs):
        if self.boundary:
            self.centroid = self.boundary.centroid
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Parcel {self.parcel_no}"
    

class PropertyDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = (
        ("lalpurja", "Lalpurja"),
        ("map", "Cadastral Map"),
        ("blueprint", "Blueprint"),
        ("tax_receipt", "Tax Receipt"),
        ("ownership", "Ownership Document"),
        ("other", "Other"),
    )

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="documents")
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to="properties/documents/")
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class PropertyInquiry(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="inquiries")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)

    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    message = models.TextField()

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Inquiry for {self.property.title}"


class FavoriteProperty(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "property")

    def __str__(self):
        return f"{self.user} - {self.property}"


class PropertyTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ("sale", "Sale"),
        ("rent", "Rent"),
        ("lease", "Lease"),
    )

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    transaction_price = models.DecimalField(max_digits=14, decimal_places=2)

    buyer_or_renter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    transaction_date = models.DateField()
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.transaction_type} - {self.property.title}"