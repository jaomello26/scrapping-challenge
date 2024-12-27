import json
from format_data import clean_and_format_reviews
from Processor import ReviewTagger

def process_data(filename):
    """Process raw review data from JSON file"""
    print("Loading and cleaning review data...")
    with open(filename, "r") as file:
        data = json.load(file)
    return clean_and_format_reviews(data)

def process_and_analyze_reviews():
    """Main function to process and analyze reviews"""
    try:
        # 1. Load and format raw data
        filename = "review.json"
        formatted_data = process_data(filename)
        print("Review data cleaned and formatted successfully.")

        # 2. Save formatted data
        with open("formatted_data.json", "w") as outfile:
            json.dump(formatted_data, outfile, indent=2)
        print("Formatted data saved to formatted_data.json")

        # 3. Perform sentiment analysis and extract key phrases
        print("\nAnalyzing reviews and extracting key phrases...")
        tagger = ReviewTagger()
        enhanced_data = tagger.process_reviews_with_top_phrases(formatted_data)
        
        # 4. Save enhanced data with key phrases
        with open('enhanced_formatted_data.json', 'w') as f:
            json.dump(enhanced_data, f, indent=2)
        print("Enhanced data saved to enhanced_formatted_data.json")

        # 5. Print summary stats
        print("\nProcessing Summary:")
        print(f"Total reviews processed: {len(formatted_data['reviews'])}")
        print(f"Positive key phrases found: {len(enhanced_data['key_phrases']['positive'])}")
        print(f"Negative key phrases found: {len(enhanced_data['key_phrases']['negative'])}")

        return enhanced_data

    except FileNotFoundError as e:
        print(f"Error: Could not find file {filename}")
        raise e
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in input file")
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        raise e

if __name__ == "__main__":
    try:
        enhanced_data = process_and_analyze_reviews()
        print("\nProcessing completed successfully!")
        
        # Print top phrases for verification
        print("\nTop Positive Phrases:")
        for phrase in enhanced_data['key_phrases']['positive']:
            print(f"- {phrase['phrase']:<30} | frequency: {phrase['frequency']:>2} | sentiment: {phrase['sentiment']:>6.2f}")
            print(f"  Found in {len(phrase['review_indices'])} reviews")
        
        print("\nTop Negative Phrases:")
        for phrase in enhanced_data['key_phrases']['negative']:
            print(f"- {phrase['phrase']:<30} | frequency: {phrase['frequency']:>2} | sentiment: {phrase['sentiment']:>6.2f}")
            print(f"  Found in {len(phrase['review_indices'])} reviews")
            
    except Exception as e:
        print(f"Failed to complete processing: {str(e)}")