from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from collections import defaultdict
import torch
import re
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np

class ReviewAnalyzer:
    def __init__(self):
        # Load BERT model and tokenizer for sentiment analysis
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            tokenizer="nlptown/bert-base-multilingual-uncased-sentiment"
        )
        
        # Load BERT model for keyword extraction
        self.tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
        self.model = AutoModelForSequenceClassification.from_pretrained('bert-base-uncased')
        
        # Initialize vectorizer for keyword extraction
        self.vectorizer = CountVectorizer(
            ngram_range=(2, 2),  # bigrams
            stop_words='english',
            min_df=2  # minimum document frequency
        )
        
    def clean_text(self, text):
        # Remove special characters and extra spaces
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        text = ' '.join(text.split())
        return text.lower()
    
    def get_sentiment_score(self, text):
        # Get sentiment using BERT
        result = self.sentiment_analyzer(text)[0]
        # Convert 1-5 star rating to -1 to 1 scale
        sentiment_score = (int(result['label'][0]) - 3) / 2
        return sentiment_score
    
    def extract_key_phrases(self, texts):
        # Clean texts
        cleaned_texts = [self.clean_text(text) for text in texts]
        
        # Fit and transform the vectorizer
        X = self.vectorizer.fit_transform(cleaned_texts)
        
        # Get feature names (bigrams)
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Calculate frequency of each bigram
        frequencies = X.sum(axis=0).A1
        
        # Create dictionary of bigrams and their frequencies
        phrases = {
            feature_names[i]: frequencies[i] 
            for i in range(len(feature_names))
            if frequencies[i] >= 2  # minimum frequency threshold
        }
        
        return phrases
    
    def process_reviews(self, formatted_data):
        reviews = formatted_data['reviews']
        
        # Prepare texts for key phrase extraction
        review_texts = []
        phrase_sentiments = defaultdict(list)
        
        for review in reviews:
            # Combine header and text with more weight on header
            full_text = f"{review['review_header']} {review['review_header']} {review['review_text']}"
            review_texts.append(full_text)
            
        # Extract key phrases
        key_phrases = self.extract_key_phrases(review_texts)
        
        # Calculate sentiment for each review and associate with phrases
        for review in reviews:
            full_text = f"{review['review_header']} {review['review_text']}"
            sentiment = self.get_sentiment_score(full_text)
            
            # Associate sentiment with phrases found in this review
            cleaned_text = self.clean_text(full_text)
            for phrase in key_phrases.keys():
                if phrase in cleaned_text:
                    phrase_sentiments[phrase].append(sentiment)
        
        # Organize tags
        organized_tags = {
            'positive': {},
            'negative': {}
        }
        
        for phrase, freq in key_phrases.items():
            if phrase_sentiments[phrase]:  # if we have sentiment scores for this phrase
                avg_sentiment = sum(phrase_sentiments[phrase]) / len(phrase_sentiments[phrase])
                tag_info = {
                    'frequency': freq,
                    'sentiment': avg_sentiment,
                    'type': 'positive' if avg_sentiment > 0 else 'negative'
                }
                
                if avg_sentiment > 0:
                    organized_tags['positive'][phrase] = tag_info
                else:
                    organized_tags['negative'][phrase] = tag_info
        
        # Sort tags by frequency and sentiment
        for sentiment_type in organized_tags:
            organized_tags[sentiment_type] = dict(
                sorted(
                    organized_tags[sentiment_type].items(),
                    key=lambda x: (x[1]['frequency'], abs(x[1]['sentiment'])),
                    reverse=True
                )
            )
        
        return {
            'product_info': formatted_data['product_info'],
            'reviews': formatted_data['reviews'],
            'tags': organized_tags
        }
