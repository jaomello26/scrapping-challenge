def clean_and_format_reviews(reviews_data):
    # Core review information to keep
    cleaned_reviews = []
    
    for review in reviews_data:
        cleaned_review = {
            'rating': review['rating'],
            "author_name": review["author_name"],
            'review_header': review['review_header'],
            'review_text': review['review_text'],
            'helpful_count': review['helpful_count'],
            'review_posted_date': review['review_posted_date'],
            'review_country': review['review_country'],
            'is_verified': review['is_verified'],
        }
        cleaned_reviews.append(cleaned_review)
    
    # Aggregate product info
    product_info = {
        'url': reviews_data[0]['url'],
        'name': reviews_data[0]['product_name'],
        'overall_rating': reviews_data[0]['product_rating'],
        'total_reviews': reviews_data[0]['product_rating_count'],
        'rating_distribution': reviews_data[0]['product_rating_object'],
        'brand': reviews_data[0]['brand'],
    }
    
    return {
        'product_info': product_info,
        'reviews': cleaned_reviews
    }
