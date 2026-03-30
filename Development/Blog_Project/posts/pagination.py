from django.http import JsonResponse
from .models import Post
from .serializers import PostSerializer


class PostPagination:
    """
    Handles pagination for the post list.
    Splits posts into pages of a fixed size.
    """

    def __init__(self, all_posts, request, page_size: int = 10):
        """
        Initialize pagination with a all_posts, request and page size.

        all_posts  — the full list of posts from the database
        request   — the HTTP request (used to read ?page= from the URL)
        page_size — how many posts per page (default 10)
        """
        self.all_posts = all_posts
        self.page_size = page_size
        self.page = self._get_page_number(request)
        self.total = all_posts.count() # Counts amount of posts using sql count

    def _get_page_number(self, request) -> int:
        """
        Read the page number from the URL query parameter.
        Example: /api/posts/?page=2 → returns 2
        Defaults to 1 if not provided or invalid.
        """
        try:
            page = int(request.query_params.get("page", 1)) # Reads the page number from url
            return page if page > 0 else 1
        except (ValueError, TypeError):
            # if someone sends ?page=abc return page 1
            return 1

    def get_page(self) -> JsonResponse:
        """
        Slice the all_posts for the current page and return a JsonResponse.
        
        Returns 404 if the page number is beyond the last page.
        """
        total_pages = self._get_total_pages()

        if self.page > total_pages and total_pages > 0:
            return JsonResponse(
                {"error": f"Page {self.page} does not exist. Total pages: {total_pages}"},
                status=404
            )

        # calculate start and end index for slicing
        start = (self.page - 1) * self.page_size   # page 1 → 0, page 2 → 10
        end = start + self.page_size                # page 1 → 10, page 2 → 20

        posts = self.all_posts[start:end] # All the page posts
        data = PostSerializer(posts, many=True).data # Database connection

        return JsonResponse({
            "count": self.total,
            "total_pages": total_pages,
            "current_page": self.page,
            "page_size": self.page_size,
            "next": self.page + 1 if self.page < total_pages else None,
            "previous": self.page - 1 if self.page > 1 else None,
            "posts": list(data)
        }, status=200) # Returns a JsonResponse

    def _get_total_pages(self) -> int:
        """
        Calculate total number of pages.
        Ceil Division rounds up everytime.
        """
        import math
        return math.ceil(self.total / self.page_size) if self.total > 0 else 1