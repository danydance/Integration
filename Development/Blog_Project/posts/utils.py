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