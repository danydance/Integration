from .models import Post


def get_post_by_id(post_id: int) -> Post | None:
    """
    Fetch a post by id from the database.
    Returns the Post if found, None if not found.
    """
    try:
        return Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return None

def validate_image(image) -> str | None:
    """
    Validates image file type and size.
    Returns an error message string if invalid, None if valid.

    Allowed types: JPEG, PNG, WEBP
    Max size: 100MB
    """
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    max_size = 100 * 1024 * 1024  # 100MB in bytes

    if image.content_type not in allowed_types:
        return "Invalid file type. Only JPEG, PNG and WEBP are allowed."

    if image.size > max_size:
        return "File too large. Maximum size is 100MB."

    return None  # valid