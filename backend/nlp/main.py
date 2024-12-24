import json
from format_data import clean_and_format_reviews
from NLP import ReviewAnalyzer

def process_data(filename):
    with open(filename, "r") as file:
        data = json.load(file)
    return clean_and_format_reviews(data)

def analyze_reviews(formatted_data):
    analyzer = ReviewAnalyzer()
    return analyzer.process_reviews(formatted_data)

def print_first_n_tags(tags, n=3):
    """Print first n items from each tag category"""
    print("\nFirst", n, "Positive Tags:")
    for i, (phrase, info) in enumerate(tags['positive'].items()):
        if i >= n:
            break
        print(f"- {phrase}: frequency={info['frequency']}, sentiment={info['sentiment']:.2f}")
    
    print("\nFirst", n, "Negative Tags:")
    for i, (phrase, info) in enumerate(tags['negative'].items()):
        if i >= n:
            break
        print(f"- {phrase}: frequency={info['frequency']}, sentiment={info['sentiment']:.2f}")

if __name__ == "__main__":
    filename = "review.json"
    formatted_data = process_data(filename)
    
    analysis = analyze_reviews(formatted_data)
    print_first_n_tags(analysis['tags'])